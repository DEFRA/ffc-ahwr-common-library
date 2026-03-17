import { ReceiveMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

const MAX_EMPTY_STREAK = 3;

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
  let emptyStreak = 0;

  while (messageById.size < limit && emptyStreak < MAX_EMPTY_STREAK) {
    const command = new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: Math.min(limit - messageById.size, 10),
      VisibilityTimeout: 0,
      WaitTimeSeconds: 0,
      AttributeNames: ["All"],
      MessageAttributeNames: ["All"],
      ...receiveOptions,
    });

    const messages = (await sqsClient.send(command)).Messages || [];

    if (messages.length === 0) {
      emptyStreak++;
    } else {
      emptyStreak = 0;
      for (const msg of messages) {
        messageById.set(msg.MessageId, msg);
      }
    }
  }

  loggerInstance.info(`Retrieved ${messageById.size} messages`);

  return Array.from(messageById.values()).map((msg) => ({
    id: msg.MessageId,
    body: msg.Body,
    attributes: msg.Attributes,
    messageAttributes: msg.MessageAttributes,
  }));
};
