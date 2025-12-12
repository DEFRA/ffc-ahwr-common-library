import { ServiceBusClient } from "@azure/service-bus";
import WebSocket from "ws";
import { HttpsProxyAgent } from "https-proxy-agent";

export const createServiceBusClient = ({
  host,
  username,
  password,
  proxyUrl,
}) => {
  const senderByAddress = {};
  const receivers = {};

  const webSocketOptions = proxyUrl
    ? {
        webSocket: WebSocket,
        webSocketConstructorOptions: {
          agent: new HttpsProxyAgent(proxyUrl),
        },
      }
    : undefined;

  const client = new ServiceBusClient(
    `Endpoint=sb://${host}/;SharedAccessKeyName=${username};SharedAccessKey=${password}`,
    { webSocketOptions }
  );

  const sendMessage = async (message, address) => {
    if (!senderByAddress[address]) {
      senderByAddress[address] = client.createSender(address);
    }
    const sender = senderByAddress[address];
    await sender.sendMessages(message);
  };

  const sendMessages = async (messages, address) =>
    sendMessage(messages, address);

  const subscribeTopic = async ({
    topicName,
    subscriptionName,
    processMessage,
    processError,
    receiverOptions = {},
    subscribeOptions = {},
  }) => {
    const key = `${topicName}:${subscriptionName}`;

    if (!receivers[key]) {
      const receiver = client.createReceiver(
        topicName,
        subscriptionName,
        receiverOptions
      );
      receivers[key] = { receiver };
    }

    const entry = receivers[key];
    if (entry.subscription) {
      return entry.subscription;
    }

    entry.subscription = entry.receiver.subscribe(
      {
        // Add receiver to allow caller to complete/defer/dead-letter message
        processMessage: (message) => processMessage(message, entry.receiver),
        processError,
      },
      {
        autoCompleteMessages: false,
        maxConcurrentCalls: 1,
        ...subscribeOptions,
      }
    );

    return entry.subscription;
  };

  const receiveSessionMessages = async (
    queueName,
    sessionId,
    count,
    sessionOptions = {},
    receiverOptions = {}
  ) => {
    const receiver = await client.acceptSession(
      queueName,
      sessionId,
      sessionOptions
    );
    const messages = await receiver.receiveMessages(count, {
      maxWaitTimeInMs: 30000,
      ...receiverOptions,
    });
    return messages;
  };

  const close = async () => {
    const addresses = Object.keys(senderByAddress);
    for (const address of addresses) {
      const sender = senderByAddress[address];
      await sender.close();
      delete senderByAddress[address];
    }

    const keys = Object.keys(receivers);
    for (const key of keys) {
      const receiver = receivers[key];
      if (receiver.subscription) {
        await receiver.subscription.close();
      }
      await receiver.close();
      delete receivers[key];
    }

    await client.close();
  };

  return {
    sendMessage,
    sendMessages,
    subscribeTopic,
    close,
    receiveSessionMessages,
  };
};
