import { createEventMessage } from "../../../app/fcp-messaging/create-event-message";

describe("createEventMessage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create and return event message", () => {
    const event = {
      name: "send-session-event",
      id: "0e4f55ea-ed42-4139-9c46-c75ba63b0742",
      sbi: "123456789",
      cph: "12/345/6789",
      status: "success",
      checkpoint: "someCheckpoint",
      type: "application:status-updated:success",
      message: "Application has been updated",
      data: {
        reference: "IAHW-G3CL-V59P",
        status: "IN_CHECK",
      },
      raisedBy: "admin",
      raisedOn: "2025-11-12T10:00:00.000Z",
    };

    const result = createEventMessage(event);

    expect(result).toEqual({
      body: {
        name: "send-session-event",
        properties: {
          id: "0e4f55ea-ed42-4139-9c46-c75ba63b0742",
          sbi: "123456789",
          cph: "12/345/6789",
          checkpoint: "someCheckpoint",
          status: "success",
          action: {
            type: "application:status-updated:success",
            message: "Application has been updated",
            data: {
              reference: "IAHW-G3CL-V59P",
              status: "IN_CHECK",
            },
            raisedBy: "admin",
            raisedOn: "2025-11-12T10:00:00.000Z",
          },
        },
      },
      type: "application:status-updated:success",
      source: "someCheckpoint",
    });
  });

  it("should default raisedOn when not provided", () => {
    const event = {
      name: "send-session-event",
      id: "0e4f55ea-ed42-4139-9c46-c75ba63b0742",
      sbi: "123456789",
      cph: "12/345/6789",
      status: "success",
      checkpoint: "someCheckpoint",
      type: "application:status-updated:success",
      message: "Application has been updated",
      data: {
        reference: "IAHW-G3CL-V59P",
        status: "IN_CHECK",
      },
      raisedBy: "admin",
    };

    const result = createEventMessage(event);

    expect(result).toEqual({
      body: {
        name: "send-session-event",
        properties: {
          id: "0e4f55ea-ed42-4139-9c46-c75ba63b0742",
          sbi: "123456789",
          cph: "12/345/6789",
          checkpoint: "someCheckpoint",
          status: "success",
          action: {
            type: "application:status-updated:success",
            message: "Application has been updated",
            data: {
              reference: "IAHW-G3CL-V59P",
              status: "IN_CHECK",
            },
            raisedBy: "admin",
            raisedOn: expect.any(String),
          },
        },
      },
      type: "application:status-updated:success",
      source: "someCheckpoint",
    });
  });
});
