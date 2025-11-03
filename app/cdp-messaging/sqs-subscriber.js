import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";
import { setTimeout } from "node:timers/promises";
import { withTraceParent } from "./trace-parent.js";

export class SqsSubscriber {
  constructor(options) {
    this.queueUrl = options.queueUrl;
    this.onMessage = options.onMessage;
    this.logger = options.logger;
    this.isRunning = false;
    this.timeoutOnPollErrorMs = options.timeoutOnErrorMs || 30000;

    this.sqsClient = new SQSClient({
      region: options.region,
      endpoint: options.awsEndpointUrl,
    });
  }

  async start() {
    this.isRunning = true;
    await this.poll();
  }

  async stop() {
    this.isRunning = false;
  }

  async poll() {
    this.logger.info(`Started polling SQS queue: ${this.queueUrl}`);

    while (this.isRunning) {
      try {
        const messages = await this.getMessages();
        await Promise.all(messages.map((m) => this.processMessage(m)));
      } catch (err) {
        this.logger.error(
          `Error polling SQS queue ${this.queueUrl}: ${err.message}`
        );
        await setTimeout(this.timeoutOnPollErrorMs);
      }
    }

    this.logger.info(`Stopped polling SQS queue: ${this.queueUrl}`);
  }

  async processMessage(message) {
    this.logger.info(`Processing SQS message ${message.MessageId}`);

    try {
      const body = JSON.parse(message.Body);
      await withTraceParent(body.traceparent, () => this.onMessage(body));
      await this.deleteMessage(message);
    } catch (err) {
      this.logger.error(
        { error: err },
        `Error processing SQS message ${message.MessageId}`
      );
    }
  }

  async getMessages() {
    const response = await this.sqsClient.send(
      new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20,
        AttributeNames: ["All"],
        MessageAttributeNames: ["All"],
      })
    );

    return response.Messages || [];
  }

  async deleteMessage(message) {
    await this.sqsClient.send(
      new DeleteMessageCommand({
        QueueUrl: this.queueUrl,
        ReceiptHandle: message.ReceiptHandle,
      })
    );
  }
}
