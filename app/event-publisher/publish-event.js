import { trackEvents } from "../app-insights/track-events.js";
import { validateEvent } from "./event-schema.js";
const { publishEventRequest } = require("../messaging/publish-event-request.js");

class PublishEvent {
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

module.exports = PublishEvent;
