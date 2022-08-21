const validateEvent = require('./event-schema')
const { trackEvent } = require('../app-insights')
const { publishEventRequest } = require('../messaging')

class PublishEvent {
  constructor (config) {
    this.appInsights = config.appInsights
    this.config = config
  }

  async sendEvent (eventMessage) {
    if (validateEvent(eventMessage)) {
      await publishEventRequest(eventMessage, this.config)
      trackEvent(eventMessage)
    }
  }
}

module.exports = PublishEvent
