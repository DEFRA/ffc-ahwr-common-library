import { validateEvent } from "../../../app/event-publisher/event-schema.js";
import { trackEvents } from "../../../app/app-insights/track-events.js";
import { PublishEventBatch } from "../../../app/event-publisher/publish-event-batch.js";
import { publishEventBatchRequest } from "../../../app/messaging/publish-event-batch-request.js";

jest.mock("../../../app/app-insights/track-events.js");
jest.mock("../../../app/event-publisher/event-schema.js");
jest.mock("../../../app/messaging/publish-event-batch-request.js");

describe("Event Publisher - Publish Event Batch", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("should publish an event batch successfully", async () => {
    validateEvent.mockReturnValue(true);
    const mockEvent1 = { type: "test_event", data: { key: "value" } };
    const mockEvent2 = { type: "test_event2", data: { key: "value" } };
    const dummyConfig = { prop: "value" };
    const publishEvent = new PublishEventBatch(dummyConfig);

    await publishEvent.sendEvents([mockEvent1, mockEvent2], true);

    expect(validateEvent).toHaveBeenCalledTimes(2);
    expect(publishEventBatchRequest).toHaveBeenCalledWith(
      [mockEvent1, mockEvent2],
      dummyConfig
    );
    expect(trackEvents).toHaveBeenCalledTimes(1);
  });

  it("should publish an event batch successfully, skipping trackEvents", async () => {
    validateEvent.mockReturnValue(true);
    const mockEvent1 = { type: "test_event", data: { key: "value" } };
    const mockEvent2 = { type: "test_event2", data: { key: "value" } };
    const dummyConfig = { prop: "value" };
    const publishEvent = new PublishEventBatch(dummyConfig);

    await publishEvent.sendEvents([mockEvent1, mockEvent2]);

    expect(validateEvent).toHaveBeenCalledTimes(2);
    expect(publishEventBatchRequest).toHaveBeenCalledWith(
      [mockEvent1, mockEvent2],
      dummyConfig
    );
    expect(trackEvents).toHaveBeenCalledTimes(0);
  });

  it("should not publish event batch if validation of any fails", async () => {
    validateEvent.mockReturnValueOnce(true).mockReturnValueOnce(false);
    const mockEvent1 = { type: "test_event", data: { key: "value" } };
    const mockEvent2 = { type: "test_event2", data: { key: "value" } };
    const dummyConfig = { prop: "value" };
    const publishEvent = new PublishEventBatch(dummyConfig);

    await publishEvent.sendEvents([mockEvent1, mockEvent2]);

    expect(validateEvent).toHaveBeenCalledTimes(2);
    expect(publishEventBatchRequest).toHaveBeenCalledTimes(0);
    expect(trackEvents).toHaveBeenCalledTimes(0);
  });
});
