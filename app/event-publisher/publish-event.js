import { trackEvents } from "../app-insights/track-events.js";
import { validateEvent } from "./event-schema.js";
import { publishEventRequest } from "../messaging/publish-event-request.js";

export class PublishEvent {
  constructor(config) {
    this.appInsights = config.appInsights;
    this.config = config;
  }

  async sendEvent(eventMessage, trackViaInsights = false) {
    if (validateEvent(eventMessage)) {
      await publishEventRequest(eventMessage, this.config);
      if (trackViaInsights) {
        trackEvents(this.appInsights, [eventMessage]);
      }
    }
  }
}
