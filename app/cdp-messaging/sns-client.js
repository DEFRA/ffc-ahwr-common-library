import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";

let defaultTopic;
let loggerInstance;
let clientSetup = false;

let snsClient;

export const setupClient = (region, awsEndpointUrl, logger, publishToTopic) => {
  snsClient = new SNSClient({
    region,
    endpoint: awsEndpointUrl,
  });
  loggerInstance = logger;
  defaultTopic = publishToTopic;
  clientSetup = true;
};

export const publishMessage = async (data, topic = defaultTopic) => {
  if(!clientSetup) {
    throw new Error('SNS client not setup. Call setupClient() before publishing messages.');
  }
  loggerInstance.info(`Publish command ${topic}`);
  await snsClient.send(
    new PublishCommand({
      TopicArn: topic,
      Message: JSON.stringify(data),
    }),
  );
};