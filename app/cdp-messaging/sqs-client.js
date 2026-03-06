import { ReceiveMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

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

  const command = new ReceiveMessageCommand({
    QueueUrl: queueUrl,
    MaxNumberOfMessages: limit,
    VisibilityTimeout: 0,
    WaitTimeSeconds: 0,
    AttributeNames: ["All"],
    MessageAttributeNames: ["All"],
    ...receiveOptions,
  });
  const result = await sqsClient.send(command);

  loggerInstance.info(`Retrieved ${result.Messages?.length || 0} messages`);

  return (result.Messages || []).map((msg) => ({
    id: msg.MessageId,
    body: msg.Body,
    attributes: msg.Attributes,
    messageAttributes: msg.MessageAttributes,
  }));
};
