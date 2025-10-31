import { reminders } from "./reminders.js";

export const getNextNotClaimedReminderToSend = (previousReminderSent) => {
  return getNextReminderToSend(reminders.notClaimed, previousReminderSent);
};

export const getNextReminderToSend = (type, previousReminderSent) => {
  if (type === reminders.notClaimed) {
    const { threeMonths, sixMonths, nineMonths } = reminders.notClaimed;
    switch (previousReminderSent) {
      case threeMonths:
        return sixMonths;
      case sixMonths:
        return nineMonths;
      case nineMonths:
        return undefined;
      default:
        return threeMonths;
    }
  }
  throw new TypeError(`The type provided is not recognised, type:${type}`);
};

export const isValidReminderType = (parentAndSubType) => {
  return Object.values(reminders).some(parentType => Object.values(parentType).includes(parentAndSubType))
};
