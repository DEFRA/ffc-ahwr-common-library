import appInsights from 'applicationinsights';
import { trackEvents } from '../../../app/app-insights/track-events.js'

jest.mock('applicationinsights', () => ({ defaultClient: { trackException: jest.fn(), trackEvent: jest.fn() }, dispose: jest.fn() }))

describe('track events', () => {
  it('should call through to application insights if available', async () => {

    await trackEvents(appInsights, [{ name: 'test-event' }]);

    expect(appInsights.defaultClient.trackEvent).toHaveBeenCalledTimes(1);
    expect(appInsights.defaultClient.trackEvent).toHaveBeenCalledWith({ name: 'test-event' });
  });

  it('should not call through to application insights if unavailable', async () => {

    await trackEvents(undefined, [{ name: 'test-event' }]);

    expect(appInsights.defaultClient.trackEvent).toHaveBeenCalledTimes(0);
  });
});