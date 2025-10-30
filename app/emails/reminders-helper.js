import { reminders } from "./reminders.js";

export const getNextNotClaimedReminderToSend = (previousReminderSent) => {
  return getNextReminderToSend(reminders.notClaimed, previousReminderSent);
};

const getNextReminderToSend = (type, previousReminderSent) => {
  if (type === reminders.notClaimed) {
    const { threeMonths, sixMonths, nineMonths } = reminders.notClaimed;
    switch (previousReminderSent) {
      case threeMonths:
        return sixMonths;
      case sixMonths:
        return nineMonths;
      default:
        return threeMonths;
    }
  }
  throw Error(`The type provided is not recognised, type:${type}`);
};
