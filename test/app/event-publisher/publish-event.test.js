import { PublishEvent } from '../../../app/event-publisher/publish-event.js'
import { validateEvent } from '../../../app/event-publisher/event-schema.js'
import { publishEventRequest } from '../../../app/messaging/publish-event-request.js'
import { trackEvents } from '../../../app/app-insights/track-events.js'

jest.mock('../../../app/app-insights/track-events.js')
jest.mock('../../../app/event-publisher/event-schema.js')
jest.mock('../../../app/messaging/publish-event-request.js')

describe('Event Publisher - Publish Event', () => {

  beforeEach(() => {
    jest.resetModules();
  });

  it('should publish an event successfully', async () => {
    validateEvent.mockReturnValueOnce(true);
    const mockEvent = { type: 'test_event', data: { key: 'value' } };
    const dummyConfig = { prop: 'value' };
    const publishEvent = new PublishEvent(dummyConfig)

    await publishEvent.sendEvent(mockEvent, true);

    expect(validateEvent).toHaveBeenCalledWith(mockEvent);
    expect(publishEventRequest).toHaveBeenCalledWith(mockEvent, dummyConfig);
    expect(trackEvents).toHaveBeenCalledTimes(1);
  });

  it('should publish an event successfully, skipping trackEvents', async () => {
    validateEvent.mockReturnValueOnce(true);
    const mockEvent = { type: 'test_event', data: { key: 'value' } };
    const dummyConfig = { prop: 'value' };
    const publishEvent = new PublishEvent(dummyConfig)

    await publishEvent.sendEvent(mockEvent);

    expect(validateEvent).toHaveBeenCalledWith(mockEvent);
    expect(publishEventRequest).toHaveBeenCalledWith(mockEvent, dummyConfig);
    expect(trackEvents).toHaveBeenCalledTimes(0);
  });

  it('should not publish event if validation fails', async () => {
    validateEvent.mockReturnValueOnce(false);
    const mockEvent = { type: 'test_event', data: { key: 'value' } };
    const dummyConfig = { prop: 'value' };
    const publishEvent = new PublishEvent(dummyConfig)

    await publishEvent.sendEvent(mockEvent);

    expect(validateEvent).toHaveBeenCalledWith(mockEvent);
    expect(publishEventRequest).toHaveBeenCalledTimes(0);
    expect(trackEvents).toHaveBeenCalledTimes(0);
  });
});