import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import {
  publishMessage,
  setupClient,
} from "../../../app/cdp-messaging/sns-client.js";

jest.mock("@aws-sdk/client-sns", () => ({
  SNSClient: jest.fn(),
  PublishCommand: jest.fn(),
}));

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
};

const topicArn = "arn:aws:sns:us-east-1:123456789012:MyTopic";

describe("publish", () => {
  it("error thrown if client not set up", async () => {
    const message = {
      key: "value",
    };

    const send = jest.fn();

    SNSClient.mockReturnValue({
      send,
    });

    PublishCommand.mockImplementation((params) => params);

    await expect(publishMessage(message)).rejects.toThrow(
      "SNS client not setup. Call setupClient() before publishing messages."
    );

    expect(PublishCommand).toHaveBeenCalledTimes(0);

    expect(send).toHaveBeenCalledTimes(0);
  });

  it("publishes a message to a topic", async () => {
    const message = {
      key: "value",
    };

    const send = jest.fn();

    SNSClient.mockReturnValue({
      send,
    });

    PublishCommand.mockImplementation((params) => params);
    setupClient("us-east-1", "http://localhost:4566", mockLogger, topicArn);

    await publishMessage(message);

    expect(PublishCommand).toHaveBeenCalledWith({
      TopicArn: topicArn,
      Message: '{"key":"value"}',
      MessageAttributes: {},
    });

    expect(send).toHaveBeenCalledWith({
      TopicArn: topicArn,
      Message: '{"key":"value"}',
      MessageAttributes: {},
    });
  });

  it("publishes a message including custom message attribute", async () => {
    const message = {
      key: "value",
    };

    const send = jest.fn();

    SNSClient.mockReturnValue({
      send,
    });

    PublishCommand.mockImplementation((params) => params);
    setupClient("us-east-1", "http://localhost:4566", mockLogger, topicArn);

    await publishMessage(
      message,
      { customAttribute: "customValue" },
      "specialTopicArn"
    );

    expect(PublishCommand).toHaveBeenCalledWith({
      TopicArn: "specialTopicArn",
      Message: '{"key":"value"}',
      MessageAttributes: {
        customAttribute: {
          DataType: "String",
          StringValue: "customValue",
        },
      },
    });

    expect(send).toHaveBeenCalledWith({
      TopicArn: "specialTopicArn",
      Message: '{"key":"value"}',
      MessageAttributes: {
        customAttribute: {
          DataType: "String",
          StringValue: "customValue",
        },
      },
    });
  });
});
