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

  const close = async () => {
    const addresses = Object.keys(senderByAddress);

    for (const address of addresses) {
      const sender = senderByAddress[address];
      await sender.close();
      delete senderByAddress[address];
    }

    await client.close();
  };

  return {
    sendMessage,
    sendMessages,
    close,
  };
};
