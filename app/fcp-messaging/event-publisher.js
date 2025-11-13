import { createEventMessage } from "./create-event-message.js";
import { validateEvent } from "./event-schema.js";

export const createEventPublisher = (client, address, logger) => {
  const publishEvent = (event) => {
    if (validateEvent(event, logger)) {
      const eventMessage = createEventMessage(event);
      client.sendMessage(eventMessage, address);
    }
  };

  const publishEvents = (events) => {
    if (events.every((eventMessage) => validateEvent(eventMessage, logger))) {
      const eventMessages = events.map(createEventMessage);
      client.sendMessages(eventMessages, address);
    }
  };

  return {
    publishEvent,
    publishEvents,
  };
};
