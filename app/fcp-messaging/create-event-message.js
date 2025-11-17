import { createMessage } from "./create-message.js";
import { STATUS } from "../constants.js";

const STATUS_ID_BY_STATUS = {
  [STATUS.AGREED]: 1,
  [STATUS.WITHDRAWN]: 2,
  [STATUS.IN_CHECK]: 5,
  [STATUS.ACCEPTED]: 6,
  [STATUS.NOT_AGREED]: 7,
  [STATUS.PAID]: 8,
  [STATUS.READY_TO_PAY]: 9,
  [STATUS.REJECTED]: 10,
  [STATUS.ON_HOLD]: 11,
  [STATUS.RECOMMENDED_TO_PAY]: 12,
  [STATUS.RECOMMENDED_TO_REJECT]: 13,
  [STATUS.AUTHORISED]: 14,
  [STATUS.SENT_TO_FINANCE]: 15,
  [STATUS.PAYMENT_HELD]: 16,
};

const replaceStatusId = (type) => {
  const status = type.split(":").pop();
  const statusId = STATUS_ID_BY_STATUS[status];

  if (!statusId) return type;

  return type.replace(status, statusId);
};

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
  const normalisedType = replaceStatusId(type);
  const event = {
    name,
    properties: {
      id,
      sbi,
      cph,
      checkpoint,
      status,
      action: {
        type: normalisedType,
        message,
        data,
        raisedBy,
        raisedOn,
      },
    },
  };

  return createMessage(event, normalisedType, checkpoint);
};
