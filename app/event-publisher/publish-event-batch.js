import { trackEvents } from "../app-insights/track-events.js";
import { validateEvent } from "./event-schema.js";
const { publishEventBatchRequest } = require("../messaging/publish-event-batch-request.js");

class PublishEventBatch {
  constructor(config) {
    this.appInsights = config.appInsights;
    this.config = config;
  }

  async sendEvents(eventMessages, trackViaInsights = false) {
    if (eventMessages.every((eventMessage) => validateEvent(eventMessage))) {
      await publishEventBatchRequest(eventMessages, this.config);
      if (trackViaInsights) {
        trackEvents(this.appInsights, eventMessages);
      }
    }
  }
}

module.exports = PublishEventBatch;
