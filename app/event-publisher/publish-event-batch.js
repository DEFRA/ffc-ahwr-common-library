const validateEvent = require("./event-schema");
const { trackEvents } = require("../app-insights");
const { publishEventBatchRequest } = require("../messaging");

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
