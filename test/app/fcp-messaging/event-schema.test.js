import { validateEvent } from "../../../app/fcp-messaging/event-schema.js";

describe("Event Schema Validation", () => {
  const mockLogger = { error: jest.fn() };

  test("should return true for a valid event schema", () => {
    const validEvent = {
      body: {
        name: "testEvent",
        properties: {
          id: "12345",
          sbi: "67890",
          cph: "CPH1234567",
          checkpoint: "checkpoint1",
          status: "active",
          reference: "ref123",
          action: {
            type: "create",
            message: "Event created successfully",
            data: {},
            error: null,
            raisedBy: "user1",
            raisedOn: "2023-10-01T12:00:00Z",
          },
        },
      },
      type: "send-session-event",
      source: "ahwr-application-backend",
    };

    expect(validateEvent(validEvent, mockLogger)).toBe(true);
    expect(mockLogger.error).not.toHaveBeenCalled();
  });

  test("should return true for an valid event schema without optional elements", () => {
    const invalidEvent = {
      body: {
        name: "testEvent",
        properties: {
          id: "12345",
          sbi: "67890",
          cph: "CPH1234567",
          checkpoint: "checkpoint1",
          status: "active",
          // reference is missing
          action: {
            type: "create",
            message: "Event created successfully",
            data: {},
            error: null,
            raisedBy: "user1",
            // raisedOn is missing
          },
        },
      },
      type: "send-session-event",
      source: "ahwr-application-backend",
    };

    expect(validateEvent(invalidEvent)).toBe(true);
    expect(mockLogger.error).not.toHaveBeenCalled();
  });

  test("should return false for an invalid event schema", () => {
    const invalidEvent = {
      name: "testEvent",
      properties: {
        cph: "CPH1234567",
        checkpoint: "checkpoint1",
        status: "active",
        reference: "ref123",
        action: {
          type: "create",
          message: "Event created successfully",
          data: {},
          error: null,
          raisedBy: "user1",
          raisedOn: "2023-10-01T12:00:00Z",
        },
      },
    };

    expect(validateEvent(invalidEvent, mockLogger)).toBe(false);
    const [errorArg, messageArg] = mockLogger.error.mock.calls[0];
    expect(errorArg).toBeInstanceOf(Error);
    expect(errorArg.message).toMatch(/"body" is required/);
    expect(messageArg).toBe("Event validation error");
  });
});
