import { createMessage } from "./create-message";

export const createEventMessage = ({
  name,
  id,
  sbi,
  cph,
  status,
  checkpoint,
  type,
  message,
  data,
  raisedBy,
  raisedOn = new Date().toISOString(),
}) => {
  const event = {
    name,
    properties: {
      id,
      sbi,
      cph,
      checkpoint,
      status,
      action: {
        type,
        message,
        data,
        raisedBy,
        raisedOn,
      },
    },
  };

  return createMessage(event, type, checkpoint);
};
