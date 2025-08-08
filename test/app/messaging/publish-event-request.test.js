import { MessageSender } from "ffc-messaging";
import { publishEventRequest } from '../../../app/messaging/publish-event-request.js'

jest.mock("ffc-messaging");

const mockSend = jest.fn()
MessageSender.prototype.sendMessage = mockSend

describe("PublishEventRequest", () => {
  test('creates message and sends via message sender', async () => {

    const config = { prop: 'value' };
    const raisedOn = new Date().toISOString();
    const message = {
      properties: {
        action: {
          type: "test.message",
          raisedOn
        },
        checkpoint: 'test-checkpoint'
      }
    }
    await publishEventRequest(message, config);

    expect(mockSend).toHaveBeenCalledWith({
      body: {
        properties: {
          action: {
            type: "test.message",
            raisedOn
          },
          checkpoint: 'test-checkpoint'
        }
      },
      source: 'test-checkpoint',
      type: 'test.message'
    });
  })

  test('creates message and sends via message sender, including default raisedOn', async () => {

    const config = { prop: 'value' };
    const message = {
      properties: {
        action: {
          type: "test.message"
        },
        checkpoint: 'test-checkpoint'
      }
    }
    await publishEventRequest(message, config);

    expect(mockSend).toHaveBeenCalledWith({
      body: {
        properties: {
          action: {
            type: "test.message",
            raisedOn: expect.any(String),
          },
          checkpoint: 'test-checkpoint'
        }
      },
      source: 'test-checkpoint',
      type: 'test.message'
    });
  })
});