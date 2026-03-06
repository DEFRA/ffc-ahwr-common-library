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

  it("throws error if client not setup", async () => {
    await expect(
      peekMessages({
        queueUrl: "test-queue",
        limit: 5,
        logger,
        receiveOptions: {},
      })
    ).rejects.toThrow(
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
    const result = await peekMessages({
      queueUrl: "test-queue",
      limit: 1,
      receiveOptions: {},
    });

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

    const result = await peekMessages({
      queueUrl: "test-queue",
      limit: 5,
      receiveOptions: {},
    });

    expect(result).toEqual([]);
    expect(logger.info).toHaveBeenCalledWith("Retrieved 0 messages");
  });
});
