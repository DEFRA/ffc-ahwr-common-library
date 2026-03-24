import { ReceiveMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

const MAX_ATTEMPTS = 3;

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
