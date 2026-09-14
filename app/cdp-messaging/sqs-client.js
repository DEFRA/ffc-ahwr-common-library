import {
  ChangeMessageVisibilityCommand,
  DeleteMessageCommand,
  ListDeadLetterSourceQueuesCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";

const MAX_ATTEMPTS = 3;
const ACTION_VISIBILITY_TIMEOUT = 30;

let sqsClient;
let loggerInstance;

export const setupClient = (region, awsEndpointUrl, logger) => {
  sqsClient = new SQSClient({
    region,
    endpoint: awsEndpointUrl,
  });
  loggerInstance = logger;
};

export const peekMessages = async (queueUrl, limit, receiveOptions) => {
  if (!sqsClient) {
    throw new Error(
      "SQS client not setup. Call setupClient() before publishing messages."
    );
  }

  const messageById = new Map();
  let attempts = 0;

  while (messageById.size < limit && attempts < MAX_ATTEMPTS) {
    const command = new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: Math.min(limit, 10),
      VisibilityTimeout: 0,
      WaitTimeSeconds: 0,
      AttributeNames: ["All"],
      MessageAttributeNames: ["All"],
      ...receiveOptions,
    });

    const messages = (await sqsClient.send(command)).Messages || [];

    for (const msg of messages) {
      messageById.set(msg.MessageId, msg);
    }

    attempts++;
  }

  loggerInstance.info(`Retrieved ${messageById.size} messages`);

  return Array.from(messageById.values()).map((msg) => ({
    id: msg.MessageId,
    body: msg.Body,
    attributes: msg.Attributes,
    messageAttributes: msg.MessageAttributes,
  }));
};

const assertClientSetup = () => {
  if (!sqsClient) {
    throw new Error(
      "SQS client not setup. Call setupClient() before publishing messages."
    );
  }
};

/**
 * Ask SQS which source queues declare the given queue as their dead-letter
 * (redrive) target. This is the authoritative way to know both whether a queue
 * is a DLQ and where a message should be reapplied to — no naming convention.
 * @param {string} queueUrl
 * @returns {Promise<string[]>} the source queue URLs (empty if none)
 */
export const getDeadLetterSourceQueues = async (queueUrl) => {
  assertClientSetup();

  const { queueUrls } = await sqsClient.send(
    new ListDeadLetterSourceQueuesCommand({ QueueUrl: queueUrl })
  );

  return queueUrls ?? [];
};

/**
 * A queue is a dead-letter queue if at least one other queue redrives to it.
 * @param {string} queueUrl
 * @returns {Promise<boolean>}
 */
export const isDeadLetterQueue = async (queueUrl) => {
  return (await getDeadLetterSourceQueues(queueUrl)).length >= 1;
};

/**
 * Apply per-message actions to a dead-letter queue. Messages are matched by
 * MessageId against a fresh receive (our peek has 0 visibility timeout), so callers
 * only need the ids from an earlier peek — receipt handles are never round-tripped.
 *
 *  - 'delete'  -> DeleteMessage from the DLQ.
 *  - 'reapply' -> SendMessage (body + attributes) to the DLQ's single source
 *                 queue (resolved via ListDeadLetterSourceQueues), then delete.
 *
 * Received messages that were not selected have their visibility reset to 0 so
 * they reappear on the queue immediately.
 *
 * @param {string} queueUrl the dead-letter queue URL
 * @param {Record<string, 'delete' | 'reapply'>} actionsById MessageId -> action
 * @param {object} [receiveOptions] extra ReceiveMessageCommand options
 * @returns {Promise<Array<{ id: string, action: string, status: 'done' | 'not-found' }>>}
 */
export const applyDlqActions = async (
  queueUrl,
  actionsById,
  receiveOptions
) => {
  assertClientSetup();

  const requestedIds = Object.keys(actionsById);
  const needsReapply = Object.values(actionsById).includes("reapply");
  const sourceQueueUrl = needsReapply
    ? await resolveSingleSourceQueue(queueUrl)
    : undefined;

  const handled = new Set();
  const remaining = new Set(requestedIds);
  let attempts = 0;

  while (remaining.size > 0 && attempts < MAX_ATTEMPTS) {
    const messages = await receiveForActions(queueUrl, receiveOptions);

    for (const msg of messages) {
      const action = remaining.has(msg.MessageId)
        ? actionsById[msg.MessageId]
        : undefined;

      await applyActionToMessage(msg, action, queueUrl, sourceQueueUrl);

      if (action) {
        handled.add(msg.MessageId);
        remaining.delete(msg.MessageId);
      }
    }

    attempts++;
  }

  loggerInstance.info(
    `Applied DLQ actions: ${handled.size}/${requestedIds.length} handled`
  );

  return requestedIds.map((id) => ({
    id,
    action: actionsById[id],
    status: handled.has(id) ? "done" : "not-found",
  }));
};

// This is for sanity purposes. The CDP team creates the dlq for you
// and they configure the source, so this should never happen.
const resolveSingleSourceQueue = async (queueUrl) => {
  const sources = await getDeadLetterSourceQueues(queueUrl);
  if (sources.length !== 1) {
    throw new Error(
      `Cannot reapply: expected exactly one source queue for ${queueUrl}, found ${sources.length}`
    );
  }
  return sources[0];
};

const receiveForActions = async (queueUrl, receiveOptions) => {
  const { Messages } = await sqsClient.send(
    new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 10,
      VisibilityTimeout: ACTION_VISIBILITY_TIMEOUT,
      WaitTimeSeconds: 0,
      AttributeNames: ["All"],
      MessageAttributeNames: ["All"],
      ...receiveOptions,
    })
  );
  return Messages ?? [];
};

const applyActionToMessage = async (msg, action, queueUrl, sourceQueueUrl) => {
  if (!action) {
    // Not selected — return it to the queue immediately so it stays visible.
    await sqsClient.send(
      new ChangeMessageVisibilityCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: msg.ReceiptHandle,
        VisibilityTimeout: 0,
      })
    );
    return;
  }

  if (action === "reapply") {
    await sqsClient.send(
      new SendMessageCommand({
        QueueUrl: sourceQueueUrl,
        MessageBody: msg.Body,
        MessageAttributes: msg.MessageAttributes,
      })
    );
  }

  await sqsClient.send(
    new DeleteMessageCommand({
      QueueUrl: queueUrl,
      ReceiptHandle: msg.ReceiptHandle,
    })
  );
};
