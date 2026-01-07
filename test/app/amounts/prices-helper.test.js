import { getAmount } from "../../../app/amounts/prices-helper.js";
import {
  basicTestResultStatus,
  claimType,
  TYPE_OF_LIVESTOCK,
} from "../../../app/constants.js";

describe("getPricesHelper", () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  describe("getAmount, original price", () => {
    test.each([
      {
        payload: {
          type: claimType.review,
          typeOfLivestock: TYPE_OF_LIVESTOCK.BEEF,
          dateOfVisit: "2025-10-22T15:26:00.000Z",
        },
        amount: 522,
      },
      {
        payload: {
          type: claimType.review,
          typeOfLivestock: TYPE_OF_LIVESTOCK.DAIRY,
          dateOfVisit: "2025-10-22T15:26:00.000Z",
        },
        amount: 372,
      },
      {
        payload: {
          type: claimType.review,
          typeOfLivestock: TYPE_OF_LIVESTOCK.PIGS,
          dateOfVisit: "2025-10-22T15:26:00.000Z",
        },
        amount: 557,
      },
      {
        payload: {
          type: claimType.review,
          typeOfLivestock: TYPE_OF_LIVESTOCK.SHEEP,
          dateOfVisit: "2025-10-22T15:26:00.000Z",
        },
        amount: 436,
      },
    ])(
      "for type: $payload.type $payload.data.typeOfLivestock should return $amount",
      async ({ payload, amount }) => {
        expect(await getAmount(payload)).toBe(amount);
      }
    );

    test.each([
      {
        payload: {
          type: claimType.endemics,
          typeOfLivestock: TYPE_OF_LIVESTOCK.BEEF,
          reviewTestResults: basicTestResultStatus.positive,
          piHunt: "yes",
          piHuntAllAnimals: "yes",
          dateOfVisit: "2025-10-22T15:26:00.000Z",
        },
        amount: 837,
      },
      {
        payload: {
          type: claimType.endemics,
          typeOfLivestock: TYPE_OF_LIVESTOCK.BEEF,
          reviewTestResults: basicTestResultStatus.negative,
          piHunt: "yes",
          piHuntRecommended: "yes",
          piHuntAllAnimals: "yes",
          dateOfVisit: "2025-10-22T15:26:00.000Z",
        },
        amount: 837,
      },
      {
        payload: {
          type: claimType.endemics,
          typeOfLivestock: TYPE_OF_LIVESTOCK.BEEF,
          reviewTestResults: basicTestResultStatus.negative,
          piHunt: "no",
          piHuntRecommended: "no",
          piHuntAllAnimals: "no",
          dateOfVisit: "2025-10-22T15:26:00.000Z",
        },
        amount: 215,
      },
      {
        payload: {
          type: claimType.endemics,
          typeOfLivestock: TYPE_OF_LIVESTOCK.DAIRY,
          reviewTestResults: basicTestResultStatus.positive,
          piHunt: "yes",
          piHuntAllAnimals: "yes",
          dateOfVisit: "2025-10-22T15:26:00.000Z",
        },
        amount: 1714,
      },
      {
        payload: {
          type: claimType.endemics,
          typeOfLivestock: TYPE_OF_LIVESTOCK.DAIRY,
          reviewTestResults: basicTestResultStatus.negative,
          piHunt: "yes",
          piHuntRecommended: "yes",
          piHuntAllAnimals: "yes",
          dateOfVisit: "2025-10-22T15:26:00.000Z",
        },
        amount: 1714,
      },
      {
        payload: {
          type: claimType.endemics,
          typeOfLivestock: TYPE_OF_LIVESTOCK.DAIRY,
          reviewTestResults: basicTestResultStatus.negative,
          piHunt: "no",
          piHuntRecommended: "no",
          piHuntAllAnimals: "no",
          dateOfVisit: "2025-10-22T15:26:00.000Z",
        },
        amount: 215,
      },
      {
        payload: {
          type: claimType.endemics,
          typeOfLivestock: TYPE_OF_LIVESTOCK.DAIRY,
          reviewTestResults: basicTestResultStatus.negative,
          piHunt: "no",
          piHuntRecommended: "no",
          piHuntAllAnimals: "no",
          dateOfVisit: "2025-01-20T15:26:00.000Z", // pre PI Hunt & Dairy go live date
        },
        amount: 215,
      },
      {
        payload: {
          type: claimType.endemics,
          typeOfLivestock: TYPE_OF_LIVESTOCK.DAIRY,
          reviewTestResults: basicTestResultStatus.positive,
          piHunt: "yes",
          dateOfVisit: "2025-01-20T15:26:00.000Z", // pre PI Hunt & Dairy go live date
        },
        amount: 1714,
      },
      {
        payload: {
          type: claimType.endemics,
          typeOfLivestock: TYPE_OF_LIVESTOCK.PIGS,
          reviewTestResults: basicTestResultStatus.negative,
          dateOfVisit: "2025-10-22T15:26:00.000Z",
        },
        amount: 923,
      },
      {
        payload: {
          type: claimType.endemics,
          typeOfLivestock: TYPE_OF_LIVESTOCK.PIGS,
          reviewTestResults: basicTestResultStatus.positive,
          dateOfVisit: "2025-10-22T15:26:00.000Z",
        },
        amount: 923,
      },
      {
        payload: {
          type: claimType.endemics,
          typeOfLivestock: TYPE_OF_LIVESTOCK.SHEEP,
          reviewTestResults: basicTestResultStatus.negative,
          dateOfVisit: "2025-10-22T15:26:00.000Z",
        },
        amount: 639,
      },
      {
        payload: {
          type: claimType.endemics,
          typeOfLivestock: TYPE_OF_LIVESTOCK.SHEEP,
          reviewTestResults: basicTestResultStatus.positive,
          dateOfVisit: "2025-10-22T15:26:00.000Z",
        },
        amount: 639,
      },
    ])(
      "for type: $payload.type $payload.data.typeOfLivestock $payload.data.testResults $payload.data.piHunt should return $amount",
      async ({ payload, amount }) => {
        expect(await getAmount(payload)).toBe(amount);
      }
    );
  });

  describe("getAmount, price uplift (22/01/2026)", () => {
    test.each([
      {
        payload: {
          type: claimType.review,
          typeOfLivestock: TYPE_OF_LIVESTOCK.BEEF,
          dateOfVisit: "2026-01-22T15:26:00.000Z",
        },
        amount: 647,
      },
      {
        payload: {
          type: claimType.review,
          typeOfLivestock: TYPE_OF_LIVESTOCK.DAIRY,
          dateOfVisit: "2026-01-22T15:26:00.000Z",
        },
        amount: 447,
      },
      {
        payload: {
          type: claimType.review,
          typeOfLivestock: TYPE_OF_LIVESTOCK.PIGS,
          dateOfVisit: "2026-01-22T15:26:00.000Z",
        },
        amount: 648,
      },
      {
        payload: {
          type: claimType.review,
          typeOfLivestock: TYPE_OF_LIVESTOCK.SHEEP,
          dateOfVisit: "2026-01-22T15:26:00.000Z",
        },
        amount: 574,
      },
    ])(
      "for type: $payload.type $payload.data.typeOfLivestock should return $amount",
      async ({ payload, amount }) => {
        expect(await getAmount(payload)).toBe(amount);
      }
    );

    test.each([
      {
        payload: {
          type: claimType.endemics,
          typeOfLivestock: TYPE_OF_LIVESTOCK.BEEF,
          reviewTestResults: basicTestResultStatus.positive,
          piHunt: "yes",
          piHuntAllAnimals: "yes",
          dateOfVisit: "2026-01-22T15:26:00.000Z",
        },
        amount: 954,
      },
      {
        payload: {
          type: claimType.endemics,
          typeOfLivestock: TYPE_OF_LIVESTOCK.BEEF,
          reviewTestResults: basicTestResultStatus.negative,
          piHunt: "yes",
          piHuntRecommended: "yes",
          piHuntAllAnimals: "yes",
          dateOfVisit: "2026-01-22T15:26:00.000Z",
        },
        amount: 954,
      },
      {
        payload: {
          type: claimType.endemics,
          typeOfLivestock: TYPE_OF_LIVESTOCK.BEEF,
          reviewTestResults: basicTestResultStatus.negative,
          piHunt: "no",
          piHuntRecommended: "no",
          piHuntAllAnimals: "no",
          dateOfVisit: "2026-01-22T15:26:00.000Z",
        },
        amount: 258,
      },
      {
        payload: {
          type: claimType.endemics,
          typeOfLivestock: TYPE_OF_LIVESTOCK.DAIRY,
          reviewTestResults: basicTestResultStatus.positive,
          piHunt: "yes",
          piHuntAllAnimals: "yes",
          dateOfVisit: "2026-01-22T15:26:00.000Z",
        },
        amount: 1844,
      },
      {
        payload: {
          type: claimType.endemics,
          typeOfLivestock: TYPE_OF_LIVESTOCK.DAIRY,
          reviewTestResults: basicTestResultStatus.negative,
          piHunt: "yes",
          piHuntRecommended: "yes",
          piHuntAllAnimals: "yes",
          dateOfVisit: "2026-01-22T15:26:00.000Z",
        },
        amount: 1844,
      },
      {
        payload: {
          type: claimType.endemics,
          typeOfLivestock: TYPE_OF_LIVESTOCK.DAIRY,
          reviewTestResults: basicTestResultStatus.negative,
          piHunt: "no",
          piHuntRecommended: "no",
          piHuntAllAnimals: "no",
          dateOfVisit: "2026-01-22T15:26:00.000Z",
        },
        amount: 258,
      },
      {
        payload: {
          type: claimType.endemics,
          typeOfLivestock: TYPE_OF_LIVESTOCK.PIGS,
          reviewTestResults: basicTestResultStatus.negative,
          dateOfVisit: "2026-01-22T15:26:00.000Z",
        },
        amount: 1087,
      },
      {
        payload: {
          type: claimType.endemics,
          typeOfLivestock: TYPE_OF_LIVESTOCK.PIGS,
          reviewTestResults: basicTestResultStatus.positive,
          dateOfVisit: "2026-01-22T15:26:00.000Z",
        },
        amount: 1087,
      },
      {
        payload: {
          type: claimType.endemics,
          typeOfLivestock: TYPE_OF_LIVESTOCK.SHEEP,
          reviewTestResults: basicTestResultStatus.negative,
          dateOfVisit: "2026-01-22T15:26:00.000Z",
        },
        amount: 658,
      },
      {
        payload: {
          type: claimType.endemics,
          typeOfLivestock: TYPE_OF_LIVESTOCK.SHEEP,
          reviewTestResults: basicTestResultStatus.positive,
          dateOfVisit: "2026-01-22T15:26:00.000Z",
        },
        amount: 658,
      },
    ])(
      "for type: $payload.type $payload.data.typeOfLivestock $payload.data.testResults $payload.data.piHunt should return $amount",
      async ({ payload, amount }) => {
        expect(await getAmount(payload)).toBe(amount);
      }
    );
  });

  test("getAmount, a non valid date for dateOfVisit will thrown an exception", () => {
    const payload = {
      type: claimType.endemics,
      typeOfLivestock: TYPE_OF_LIVESTOCK.DAIRY,
      reviewTestResults: basicTestResultStatus.negative,
      piHunt: "no",
      dateOfVisit: "hokum",
    };

    expect(() => getAmount(payload)).toThrow(
      "dateOfVisit must be parsable as a date, value provided: hokum"
    );
  });
});
