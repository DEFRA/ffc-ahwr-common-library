import {
  getNextNotClaimedReminderToSend,
  getNextReminderToSend,
  isValidReminderType,
} from "../../../app/emails/reminders-helper.js";
import { reminders } from "../../../app/emails/reminders.js";

const { notClaimed } = reminders;

describe("getNextReminderToSend", () => {
  test("Error when type not recognised", () => {
    const invalidType = "foo";
    const previousReminderSent = undefined;

    expect(() =>
      getNextReminderToSend(invalidType, previousReminderSent)
    ).toThrow("The type provided is not recognised, type:foo");
  });
});

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

  test("After nineMonths, undefined should be returned", () => {
    const previousReminderSent = notClaimed.nineMonths;

    const nextReminder = getNextNotClaimedReminderToSend(previousReminderSent);

    expect(nextReminder).toBeUndefined();
  });
});

describe("isValidReminderType", () => {
  test("Valid parent and sub type should return true", () => {
    const parentAndSubType = "notClaimed_sixMonths";

    const exists = isValidReminderType(parentAndSubType);

    expect(exists).toBe(true);
  });

  test("Invalid parent type should return false", () => {
    const parentAndSubType = "invalidParentType_sixMonths";

    const exists = isValidReminderType(parentAndSubType);

    expect(exists).toBe(false);
  });

  test("Invalid sub type should return false", () => {
    const parentAndSubType = "notClaimed_invalidSubType";

    const exists = isValidReminderType(parentAndSubType);

    expect(exists).toBe(false);
  });
});
