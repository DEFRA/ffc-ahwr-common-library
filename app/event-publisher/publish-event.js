const validateEvent = require("./event-schema");
const { trackEvents } = require("../app-insights");
const { publishEventRequest } = require("../messaging");

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
