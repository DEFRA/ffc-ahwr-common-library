const { MessageBatchSender } = require('ffc-messaging')
const createMessage = require('./create-message')

const publishEventBatchRequest = async (eventMessages, config) => {
  const messages = eventMessages.map(message => {
    message.properties.action.timestamp = new Date().toISOString()
    return createMessage(message, message.properties.action.type, message.properties.checkpoint)
  })
  const eventSender = new MessageBatchSender(config)
  await eventSender.sendBatchMessages(messages)
  await eventSender.closeConnection()
}

module.exports = publishEventBatchRequest
