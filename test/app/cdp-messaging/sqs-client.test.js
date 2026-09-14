import {
  setupClient,
  peekMessages,
  getDeadLetterSourceQueues,
  isDeadLetterQueue,
  applyDlqActions,
} from "../../../app/cdp-messaging/sqs-client";
import {
  SQSClient,
  ReceiveMessageCommand,
  ListDeadLetterSourceQueuesCommand,
  DeleteMessageCommand,
  SendMessageCommand,
  ChangeMessageVisibilityCommand,
} from "@aws-sdk/client-sqs";

jest.mock("@aws-sdk/client-sqs");

describe("peekMessages", () => {
  const sendMock = jest.fn();
  const logger = {
    info: jest.fn(),
  };

  beforeEach(() => {
    SQSClient.mockImplementation(() => ({
      send: sendMock,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMsg = (id) => ({
    MessageId: id,
    Body: "body",
    Attributes: {},
    MessageAttributes: {},
  });

  it("throws error if client not setup", async () => {
    await expect(peekMessages("test-queue", 5, {})).rejects.toThrow(
      "SQS client not setup. Call setupClient() before publishing messages."
    );
  });

  it("retrieves and maps messages correctly", async () => {
    const mockMessages = [
      {
        MessageId: "1",
        Body: { id: 1, cph: "10/333/4444" },
        Attributes: { ApproximateReceiveCount: "1" },
        MessageAttributes: { attr1: { StringValue: "value1" } },
      },
    ];
    sendMock.mockResolvedValue({
      Messages: mockMessages,
    });

    setupClient("eu-west-1", "http://localhost:4566", logger);
    const result = await peekMessages("test-queue", 1, {});

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock.mock.calls[0][0]).toBeInstanceOf(ReceiveMessageCommand);
    expect(result).toEqual([
      {
        id: "1",
        body: { id: 1, cph: "10/333/4444" },
        attributes: { ApproximateReceiveCount: "1" },
        messageAttributes: { attr1: { StringValue: "value1" } },
      },
    ]);
    expect(logger.info).toHaveBeenCalledWith("Retrieved 1 messages");
  });

  it("returns empty array when no messages found", async () => {
    sendMock.mockResolvedValue({});

    setupClient("eu-west-1", "http://localhost:4566", logger);
    const result = await peekMessages("test-queue", 5, {});

    expect(result).toEqual([]);
    expect(logger.info).toHaveBeenCalledWith("Retrieved 0 messages");
  });

  it("deduplicates messages with the same MessageId", async () => {
    const duplicateMessage = createMsg("1");
    sendMock
      .mockResolvedValueOnce({ Messages: [duplicateMessage] })
      .mockResolvedValueOnce({ Messages: [duplicateMessage] })
      .mockResolvedValue({});

    setupClient("eu-west-1", "http://localhost:4566", logger);
    const result = await peekMessages("test-queue", 5, {});

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("stops polling after 3 consecutive empty responses", async () => {
    sendMock.mockResolvedValue({ Messages: [] });

    setupClient("eu-west-1", "http://localhost:4566", logger);
    const result = await peekMessages("test-queue", 10, {});

    expect(sendMock).toHaveBeenCalledTimes(3);
    expect(result).toEqual([]);
  });

  it("stops polling once limit is reached", async () => {
    sendMock
      .mockResolvedValueOnce({ Messages: [createMsg("1"), createMsg("2")] })
      .mockResolvedValueOnce({ Messages: [createMsg("3")] });

    setupClient("eu-west-1", "http://localhost:4566", logger);
    const result = await peekMessages("test-queue", 3, {});

    expect(result).toHaveLength(3);
    expect(sendMock).toHaveBeenCalledTimes(2);
  });

  it("accumulates messages across multiple polls", async () => {
    sendMock
      .mockResolvedValueOnce({ Messages: [createMsg("1")] })
      .mockResolvedValueOnce({ Messages: [createMsg("2")] })
      .mockResolvedValue({});

    setupClient("eu-west-1", "http://localhost:4566", logger);
    const result = await peekMessages("test-queue", 5, {});

    expect(result).toHaveLength(2);
    expect(result.map((m) => m.id)).toEqual(["1", "2"]);
  });

  it("stops polling if the user requests more messages than whats available", async () => {
    sendMock.mockResolvedValue({ Messages: [createMsg("1"), createMsg("2")] });

    setupClient("eu-west-1", "http://localhost:4566", logger);
    const result = await peekMessages("test-queue", 4, {});

    expect(result).toHaveLength(2);
    expect(sendMock).toHaveBeenCalledTimes(3);
  });
});

describe("getDeadLetterSourceQueues", () => {
  const sendMock = jest.fn();
  const logger = { info: jest.fn(), error: jest.fn() };

  beforeEach(() => {
    SQSClient.mockImplementation(() => ({ send: sendMock }));
  });

  afterEach(() => jest.clearAllMocks());

  it("returns the source queue urls SQS reports for the dlq", async () => {
    sendMock.mockResolvedValue({
      queueUrls: ["https://host/123/source-queue"],
    });
    setupClient("eu-west-1", "http://localhost:4566", logger);

    const result = await getDeadLetterSourceQueues("https://host/123/dlq");

    expect(sendMock.mock.calls[0][0]).toBeInstanceOf(
      ListDeadLetterSourceQueuesCommand
    );
    expect(ListDeadLetterSourceQueuesCommand).toHaveBeenCalledWith({
      QueueUrl: "https://host/123/dlq",
    });
    expect(result).toEqual(["https://host/123/source-queue"]);
  });

  it("returns an empty array when SQS reports no source queues", async () => {
    sendMock.mockResolvedValue({});
    setupClient("eu-west-1", "http://localhost:4566", logger);

    expect(await getDeadLetterSourceQueues("https://host/123/normal")).toEqual(
      []
    );
  });
});

describe("isDeadLetterQueue", () => {
  const sendMock = jest.fn();
  const logger = { info: jest.fn(), error: jest.fn() };

  beforeEach(() => {
    SQSClient.mockImplementation(() => ({ send: sendMock }));
  });

  afterEach(() => jest.clearAllMocks());

  it("is true when the queue is the redrive target of at least one source queue", async () => {
    sendMock.mockResolvedValue({
      queueUrls: ["https://host/123/source-queue"],
    });
    setupClient("eu-west-1", "http://localhost:4566", logger);

    expect(await isDeadLetterQueue("https://host/123/dlq")).toBe(true);
  });

  it("is false when no source queue points at it", async () => {
    sendMock.mockResolvedValue({ queueUrls: [] });
    setupClient("eu-west-1", "http://localhost:4566", logger);

    expect(await isDeadLetterQueue("https://host/123/normal")).toBe(false);
  });
});

describe("applyDlqActions", () => {
  const sendMock = jest.fn();
  const logger = { info: jest.fn(), error: jest.fn() };
  const dlqUrl = "https://host/123/inbound-dlq";
  const sourceUrl = "https://host/123/inbound";

  const createMsg = (id) => ({
    MessageId: id,
    ReceiptHandle: `rh-${id}`,
    Body: `body-${id}`,
    Attributes: {},
    MessageAttributes: { attr: { DataType: "String", StringValue: id } },
  });

  const receive = (...messages) => ({ Messages: messages });
  const listSources = (...queueUrls) => ({ queueUrls });

  beforeEach(() => {
    SQSClient.mockImplementation(() => ({ send: sendMock }));
  });

  afterEach(() => jest.clearAllMocks());

  it("deletes a selected message using its fresh receipt handle", async () => {
    sendMock
      .mockResolvedValueOnce(receive(createMsg("1")))
      .mockResolvedValue({});

    setupClient("eu-west-1", "http://localhost:4566", logger);
    const result = await applyDlqActions(dlqUrl, { 1: "delete" });

    expect(DeleteMessageCommand).toHaveBeenCalledTimes(1);
    expect(DeleteMessageCommand).toHaveBeenCalledWith({
      QueueUrl: dlqUrl,
      ReceiptHandle: "rh-1",
    });
    expect(SendMessageCommand).toHaveBeenCalledTimes(0);
    expect(ListDeadLetterSourceQueuesCommand).toHaveBeenCalledTimes(0);
    expect(result).toEqual([{ id: "1", action: "delete", status: "done" }]);
  });

  it("reapplies a message: resolves the source queue, sends to it, then deletes from the dlq", async () => {
    sendMock
      .mockResolvedValueOnce(listSources(sourceUrl))
      .mockResolvedValueOnce(receive(createMsg("1")))
      .mockResolvedValue({});

    setupClient("eu-west-1", "http://localhost:4566", logger);
    const result = await applyDlqActions(dlqUrl, { 1: "reapply" });

    expect(ListDeadLetterSourceQueuesCommand).toHaveBeenCalledWith({
      QueueUrl: dlqUrl,
    });
    expect(SendMessageCommand).toHaveBeenCalledTimes(1);
    expect(SendMessageCommand).toHaveBeenCalledWith({
      QueueUrl: sourceUrl,
      MessageBody: "body-1",
      MessageAttributes: { attr: { DataType: "String", StringValue: "1" } },
    });
    expect(DeleteMessageCommand).toHaveBeenCalledTimes(1);
    expect(DeleteMessageCommand).toHaveBeenCalledWith({
      QueueUrl: dlqUrl,
      ReceiptHandle: "rh-1",
    });
    expect(result).toEqual([{ id: "1", action: "reapply", status: "done" }]);
  });

  it("throws when reapply is requested but the dlq has no single source queue", async () => {
    sendMock.mockResolvedValueOnce(listSources()); // zero sources

    setupClient("eu-west-1", "http://localhost:4566", logger);

    await expect(applyDlqActions(dlqUrl, { 1: "reapply" })).rejects.toThrow(
      /source queue/i
    );
    expect(ReceiveMessageCommand).toHaveBeenCalledTimes(0);
  });

  it("throws when reapply is ambiguous (more than one source queue)", async () => {
    sendMock.mockResolvedValueOnce(
      listSources(sourceUrl, "https://host/123/other")
    );

    setupClient("eu-west-1", "http://localhost:4566", logger);

    await expect(applyDlqActions(dlqUrl, { 1: "reapply" })).rejects.toThrow(
      /source queue/i
    );
  });

  it("resets visibility of received-but-unselected messages", async () => {
    sendMock
      .mockResolvedValueOnce(receive(createMsg("1"), createMsg("2")))
      .mockResolvedValue({});

    setupClient("eu-west-1", "http://localhost:4566", logger);
    const result = await applyDlqActions(dlqUrl, { 1: "delete" });

    expect(ChangeMessageVisibilityCommand).toHaveBeenCalledTimes(1);
    expect(ChangeMessageVisibilityCommand).toHaveBeenCalledWith({
      QueueUrl: dlqUrl,
      ReceiptHandle: "rh-2",
      VisibilityTimeout: 0,
    });
    expect(result).toEqual([{ id: "1", action: "delete", status: "done" }]);
  });

  it("handles a mix of delete and reapply in one call", async () => {
    sendMock
      .mockResolvedValueOnce(listSources(sourceUrl))
      .mockResolvedValueOnce(receive(createMsg("1"), createMsg("2")))
      .mockResolvedValue({});

    setupClient("eu-west-1", "http://localhost:4566", logger);
    const result = await applyDlqActions(dlqUrl, { 1: "delete", 2: "reapply" });

    expect(SendMessageCommand).toHaveBeenCalledTimes(1);
    expect(DeleteMessageCommand).toHaveBeenCalledTimes(2);
    expect(result).toEqual([
      { id: "1", action: "delete", status: "done" },
      { id: "2", action: "reapply", status: "done" },
    ]);
  });

  it("reports ids that were never received as not-found", async () => {
    sendMock
      .mockResolvedValueOnce(receive(createMsg("1")))
      .mockResolvedValue({});

    setupClient("eu-west-1", "http://localhost:4566", logger);
    const result = await applyDlqActions(dlqUrl, { 1: "delete", 99: "delete" });

    expect(result).toEqual([
      { id: "1", action: "delete", status: "done" },
      { id: "99", action: "delete", status: "not-found" },
    ]);
  });
});
