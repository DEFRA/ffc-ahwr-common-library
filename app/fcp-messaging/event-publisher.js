import { createEventMessage } from "./create-event-message.js";
import { validateEvent } from "./event-schema.js";

export const createEventPublisher = (client, address, logger) => {
  const publishEvent = (event) => {
    const eventMessage = createEventMessage(event);
    if (validateEvent(event, logger)) {
      client.sendMessage(eventMessage, address);
    }
  };

  const publishEvents = (events) => {
    const eventMessages = events.map(createEventMessage);
    if (eventMessages.every((message) => validateEvent(message, logger))) {
      client.sendMessages(eventMessages, address);
    }
  };

  return {
    publishEvent,
    publishEvents,
  };
};
