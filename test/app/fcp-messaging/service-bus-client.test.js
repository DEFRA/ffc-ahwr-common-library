import { createServiceBusClient } from "../../../app/fcp-messaging/service-bus-client";
import { ServiceBusClient } from "@azure/service-bus";
import WebSocket from "ws";
import { HttpsProxyAgent } from "https-proxy-agent";

jest.mock("@azure/service-bus");
jest.mock("ws");
jest.mock("https-proxy-agent");

describe("createServiceBusClient", () => {
  let mockSender, mockClient, mockReceiver, mockSubscription;

  beforeEach(() => {
    mockSender = {
      sendMessages: jest.fn().mockResolvedValue(),
      close: jest.fn().mockResolvedValue(),
    };
    mockSubscription = { close: jest.fn() };
    mockReceiver = {
      subscribe: jest.fn().mockReturnValue(mockSubscription),
      receiveMessages: jest.fn(),
      close: jest.fn(),
    };
    mockClient = {
      createSender: jest.fn().mockReturnValue(mockSender),
      createReceiver: jest.fn().mockReturnValue(mockReceiver),
      close: jest.fn().mockResolvedValue(),
      acceptSession: jest.fn().mockReturnValue(mockReceiver),
    };

    ServiceBusClient.mockImplementation(() => mockClient);
    HttpsProxyAgent.mockImplementation(() => ({}));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a ServiceBusClient with correct connection string", () => {
    createServiceBusClient({
      host: "test-host.servicebus.windows.net",
      username: "user",
      password: "pass",
      proxyUrl: "http://proxy.example.com",
    });

    expect(ServiceBusClient).toHaveBeenCalledWith(
      "Endpoint=sb://test-host.servicebus.windows.net/;SharedAccessKeyName=user;SharedAccessKey=pass",
      {
        webSocketOptions: {
          webSocket: WebSocket,
          webSocketConstructorOptions: {
            agent: new HttpsProxyAgent("http://proxy.example.com"),
          },
        },
      }
    );
  });

  it("should create a ServiceBusClient without proxy when proxyUrl is missing", () => {
    createServiceBusClient({
      host: "test-host.servicebus.windows.net",
      username: "user",
      password: "pass",
      proxyUrl: undefined,
    });

    expect(ServiceBusClient).toHaveBeenCalledWith(
      "Endpoint=sb://test-host.servicebus.windows.net/;SharedAccessKeyName=user;SharedAccessKey=pass",
      {
        webSocketOptions: undefined,
      }
    );
  });

  describe("sendMessage", () => {
    it("should send a message using a created sender", async () => {
      const client = createServiceBusClient({
        host: "host",
        username: "user",
        password: "pass",
        proxyUrl: "http://proxy.example.com",
      });

      await client.sendMessage({ body: { field1: "value1" } }, "queue1");

      expect(mockClient.createSender).toHaveBeenCalledWith("queue1");
      expect(mockSender.sendMessages).toHaveBeenCalledWith({
        body: { field1: "value1" },
      });
    });

    it("should reuse an existing sender for the same address", async () => {
      const client = createServiceBusClient({
        host: "host",
        username: "user",
        password: "pass",
        proxyUrl: "http://proxy.example.com",
      });

      await client.sendMessage({ body: "msg1" }, "queue1");
      await client.sendMessage({ body: "msg2" }, "queue1");

      expect(mockClient.createSender).toHaveBeenCalledTimes(1);
      expect(mockSender.sendMessages).toHaveBeenCalledTimes(2);
    });
  });

  describe("close", () => {
    it("should close all senders, receivers and the client", async () => {
      const client = createServiceBusClient({
        host: "host",
        username: "user",
        password: "pass",
        proxyUrl: "http://proxy.example.com",
      });

      await client.sendMessage({ body: "close-test" }, "queue1");
      await client.subscribeTopic({
        topicName: "topicA",
        subscriptionName: "sub1",
        processMessage: () => {},
        processError: () => {},
      });
      await client.close();

      expect(mockSender.close).toHaveBeenCalled();
      expect(mockReceiver.close).toHaveBeenCalled();
      expect(mockClient.close).toHaveBeenCalled();
    });
  });

  describe("subscribeTopic", () => {
    let client;

    beforeEach(() => {
      client = createServiceBusClient({
        host: "host",
        username: "user",
        password: "pass",
        proxyUrl: "http://proxy.example.com",
      });
    });

    test("creates a new receiver when key does not exist", async () => {
      const processMessage = jest.fn();
      const processError = jest.fn();

      const result = await client.subscribeTopic({
        topicName: "topicA",
        subscriptionName: "sub1",
        processMessage,
        processError,
      });

      expect(mockClient.createReceiver).toHaveBeenCalledWith(
        "topicA",
        "sub1",
        {}
      );

      expect(mockReceiver.subscribe).toHaveBeenCalledWith(
        {
          processMessage: expect.any(Function),
          processError,
        },
        {
          autoCompleteMessages: false,
          maxConcurrentCalls: 1,
        }
      );

      expect(result).toBe(mockSubscription);
    });

    test("reuses existing receiver and subscription on second call", async () => {
      const processMessage = jest.fn();
      const processError = jest.fn();

      const firstSubscription = await client.subscribeTopic({
        topicName: "topicA",
        subscriptionName: "sub1",
        processMessage,
        processError,
      });

      const secondSubscription = await client.subscribeTopic({
        topicName: "topicA",
        subscriptionName: "sub1",
        processMessage,
        processError,
      });

      expect(secondSubscription).toBe(firstSubscription);
      expect(mockClient.createReceiver).toHaveBeenCalledTimes(1);
    });
  });

  describe("receiveSessionMessages", () => {
    let client;

    beforeEach(() => {
      client = createServiceBusClient({
        host: "host",
        username: "user",
        password: "pass",
        proxyUrl: "http://proxy.example.com",
      });
    });

    it("should accept a session and receive messages", async () => {
      const queueName = "test-queue";
      const sessionId = "abc123";
      const count = 2;
      mockReceiver.receiveMessages.mockResolvedValue(["msg1", "msg2"]);

      const result = await client.receiveSessionMessages(
        queueName,
        sessionId,
        count,
        { receiveMode: "peekLock" },
        { maxWaitTimeInMs: 60000 }
      );

      expect(mockClient.acceptSession).toHaveBeenCalledWith(
        queueName,
        sessionId,
        { receiveMode: "peekLock" }
      );
      expect(mockReceiver.receiveMessages).toHaveBeenCalledWith(2, {
        maxWaitTimeInMs: 60000,
      });
      expect(result).toEqual(["msg1", "msg2"]);
    });
  });
});
