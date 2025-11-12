import { createEventPublisher } from "../../../app/fcp-messaging/event-publisher";
import { validateEvent } from "../../../app/fcp-messaging/event-schema";
import { createEventMessage } from "../../../app/fcp-messaging/create-event-message";

jest.mock("../../../app/fcp-messaging/event-schema");
jest.mock("../../../app/fcp-messaging/create-event-message");

describe("createEventPublisher", () => {
  let mockClient;
  let mockLogger;
  let mockAddress;
  let publisher;

  beforeEach(() => {
    mockClient = {
      sendMessage: jest.fn(),
      sendMessages: jest.fn(),
    };
    mockLogger = { error: jest.fn(), info: jest.fn() };
    mockAddress = "test-address";

    publisher = createEventPublisher(mockClient, mockAddress, mockLogger);

    jest.clearAllMocks();
  });

  describe("publishEvent", () => {
    it("should validate the event and send a message if valid", () => {
      const mockEvent = { type: "claim-updated" };
      const mockMessage = { body: "event message" };
      validateEvent.mockReturnValue(true);
      createEventMessage.mockReturnValue(mockMessage);

      publisher.publishEvent(mockEvent);

      expect(validateEvent).toHaveBeenCalledWith(mockEvent, mockLogger);
      expect(createEventMessage).toHaveBeenCalledWith(mockEvent);
      expect(mockClient.sendMessage).toHaveBeenCalledWith(
        mockMessage,
        mockAddress
      );
    });

    it("should not send a message if validation fails", () => {
      const mockEvent = { type: "INVALID_EVENT" };
      validateEvent.mockReturnValue(false);

      publisher.publishEvent(mockEvent);

      expect(validateEvent).toHaveBeenCalledWith(mockEvent, mockLogger);
      expect(createEventMessage).not.toHaveBeenCalled();
      expect(mockClient.sendMessage).not.toHaveBeenCalled();
    });
  });

  describe("publishEvents", () => {
    it("should validate all events and send messages if all are valid", () => {
      const mockEvents = [{ id: 1 }, { id: 2 }];
      validateEvent.mockReturnValue(true);
      createEventMessage.mockImplementation((event) => ({
        body: `msg${event.id}`,
      }));

      publisher.publishEvents(mockEvents);

      expect(validateEvent).toHaveBeenCalledTimes(mockEvents.length);
      expect(createEventMessage).toHaveBeenCalledTimes(mockEvents.length);
      expect(mockClient.sendMessages).toHaveBeenCalledWith(
        [{ body: "msg1" }, { body: "msg2" }],
        mockAddress
      );
    });

    it("should not send messages if any validation fails", () => {
      const mockEvents = [{ id: 1 }, { id: 2 }];
      validateEvent.mockReturnValueOnce(true).mockReturnValueOnce(false);

      publisher.publishEvents(mockEvents);

      expect(validateEvent).toHaveBeenCalledTimes(2);
      expect(createEventMessage).not.toHaveBeenCalled();
      expect(mockClient.sendMessages).not.toHaveBeenCalled();
    });
  });
});
