const validateEvent = require('./event-schema')
const { trackEvents } = require('../app-insights')
const { publishEventBatchRequest } = require('../messaging')

class PublishEventBatch {
  constructor (config) {
    this.appInsights = config.appInsights
    this.config = config
  }

  async sendEvents (eventMessages) {
    if (eventMessages.every(eventMessage => validateEvent(eventMessage))) {
      await publishEventBatchRequest(eventMessages, this.config)
      trackEvents(this.appInsights, eventMessages)
    }
  }
}

module.exports = PublishEventBatch
