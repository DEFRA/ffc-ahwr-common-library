import { validateEvent } from '../../../app/event-publisher/event-schema.js'

describe("Event Schema Validation", () => {
  test('should return true for a valid event schema', () => {
    const validEvent = {
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
          raisedOn: "2023-10-01T12:00:00Z"
        }
      }
    };

    expect(validateEvent(validEvent)).toBe(true);
  });

  test('should return true for an valid event schema without optional elements', () => {
    const invalidEvent = {
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
          raisedBy: "user1"
          // raisedOn is missing
        }
      }
    };

    expect(validateEvent(invalidEvent)).toBe(true);
  });


  test('should return false for an invalid event schema', () => {
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
          raisedOn: "2023-10-01T12:00:00Z"
        }
      }
    };

    expect(validateEvent(invalidEvent)).toBe(false);
  });
});