import {
  setupClient,
  peekMessages,
} from "../../../app/cdp-messaging/sqs-client";
import { SQSClient, ReceiveMessageCommand } from "@aws-sdk/client-sqs";

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
    const duplicateMessage = {
      MessageId: "1",
      Body: "body",
      Attributes: {},
      MessageAttributes: {},
    };
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
});
