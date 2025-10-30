import { getNextNotClaimedReminderToSend } from "../../../app/emails/reminders-helper.js";
import { reminders } from "../../../app/emails/reminders.js";

const { notClaimed } = reminders;

describe("getNextNotClaimedReminderToSend", () => {
  test("First NotClaimed reminder should be threeMonths", () => {
    const previousReminderSent = undefined;

    const nextReminder = getNextNotClaimedReminderToSend(previousReminderSent);

    expect(nextReminder).toBe(notClaimed.threeMonths);
  });

  test("After threeMonths, the next reminder should be sixMonths", () => {
    const previousReminderSent = notClaimed.threeMonths;

    const nextReminder = getNextNotClaimedReminderToSend(previousReminderSent);

    expect(nextReminder).toBe(notClaimed.sixMonths);
  });

  test("After sixMonths, the next reminder should be nineMonths", () => {
    const previousReminderSent = notClaimed.sixMonths;

    const nextReminder = getNextNotClaimedReminderToSend(previousReminderSent);

    expect(nextReminder).toBe(notClaimed.nineMonths);
  });
});
