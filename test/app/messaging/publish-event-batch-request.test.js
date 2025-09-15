import { MessageBatchSender } from "ffc-messaging";
import { publishEventBatchRequest } from "../../../app/messaging/publish-event-batch-request.js";

jest.mock("ffc-messaging");

const mockSend = jest.fn();
MessageBatchSender.prototype.sendBatchMessages = mockSend;

describe("PublishEventBatchRequest", () => {
  test("creates message and sends via message batch sender", async () => {
    const config = { prop: "value" };
    const message1 = {
      properties: {
        action: {
          type: "test.message1",
        },
        checkpoint: "test-checkpoint",
      },
    };

    const message2 = {
      properties: {
        action: {
          type: "test.message2",
        },
        checkpoint: "test-checkpoint",
      },
    };
    await publishEventBatchRequest([message1, message2], config);

    expect(mockSend).toHaveBeenCalledWith([
      {
        body: {
          properties: {
            action: {
              type: "test.message1",
              timestamp: expect.any(String),
            },
            checkpoint: "test-checkpoint",
          },
        },
        source: "test-checkpoint",
        type: "test.message1",
      },
      {
        body: {
          properties: {
            action: {
              type: "test.message2",
              timestamp: expect.any(String),
            },
            checkpoint: "test-checkpoint",
          },
        },
        source: "test-checkpoint",
        type: "test.message2",
      },
    ]);
  });
});
