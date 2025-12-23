import { ServiceBusClient } from "@azure/service-bus";
import WebSocket from "ws";
import { HttpsProxyAgent } from "https-proxy-agent";

const closeAllSenders = async (senderByAddress) => {
  const addresses = Object.keys(senderByAddress);

  for (const address of addresses) {
    await senderByAddress[address].close();
    delete senderByAddress[address];
  }
};

const closeAllReceivers = async (receiverSubscriptions) => {
  const keys = Object.keys(receiverSubscriptions);

  for (const key of keys) {
    const entry = receiverSubscriptions[key];

    if (entry.subscription) {
      await entry.subscription.close();
    }

    await entry.receiver.close();
    delete receiverSubscriptions[key];
  }
};

const createReceiverSubscription = (
  client,
  receiverSubscriptions,
  {
    topicName,
    subscriptionName,
    processMessage,
    processError,
    receiverOptions = {},
    subscribeOptions = {},
  }
) => {
  const key = `${topicName}:${subscriptionName}`;

  if (!receiverSubscriptions[key]) {
    const receiver = client.createReceiver(
      topicName,
      subscriptionName,
      receiverOptions
    );

    const subscription = receiver.subscribe(
      {
        processMessage: (msg) => processMessage(msg, receiver),
        processError,
      },
      {
        autoCompleteMessages: false,
        maxConcurrentCalls: 1,
        ...subscribeOptions,
      }
    );

    receiverSubscriptions[key] = { receiver, subscription };
  }

  return receiverSubscriptions[key].subscription;
};

export const createServiceBusClient = ({
  host,
  username,
  password,
  proxyUrl,
}) => {
  const senderByAddress = {};
  const receiverSubscriptions = {};

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

  const subscribeTopic = (params) =>
    createReceiverSubscription(client, receiverSubscriptions, params);

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
    return { receiver, messages };
  };

  const close = async () => {
    await closeAllSenders(senderByAddress);
    await closeAllReceivers(receiverSubscriptions);
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
