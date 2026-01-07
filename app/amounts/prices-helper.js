import {
  basicTestResultStatus,
  claimType as CLAIM_TYPE,
  PI_HUNT_AND_DAIRY_FOLLOW_UP_RELEASE_DATE,
  TYPE_OF_LIVESTOCK,
  PIGS_AND_PAYMENTS_RELEASE_DATE,
} from "../constants.js";
import { pricesOriginal, pricesUplifted } from "./prices.js";

const isPostPaymentRateUplift = (dateOfVisit) => {
  const dateOfVisitParsed = new Date(dateOfVisit);
  if (Number.isNaN(dateOfVisitParsed.getTime())) {
    throw new TypeError(
      `dateOfVisit must be parsable as a date, value provided: ${dateOfVisit}`
    );
  }
  return new Date(dateOfVisit) >= PIGS_AND_PAYMENTS_RELEASE_DATE;
};

const isVisitDateAfterPIHuntAndDairyGoLive = (dateOfVisit) => {
  const dateOfVisitParsed = new Date(dateOfVisit);
  return dateOfVisitParsed >= PI_HUNT_AND_DAIRY_FOLLOW_UP_RELEASE_DATE;
};

const getPiHuntValue = (
  reviewTestResults,
  piHunt,
  piHuntAllAnimals,
  claimType,
  typeOfLivestock,
  prices
) => {
  const optionalPiHuntValue =
    piHunt === "yes" && piHuntAllAnimals === "yes" ? "yesPiHunt" : "noPiHunt";

  if (reviewTestResults === basicTestResultStatus.positive) {
    return prices[claimType][typeOfLivestock].value[reviewTestResults];
  }

  return prices[claimType][typeOfLivestock].value[reviewTestResults][
    optionalPiHuntValue
  ];
};

const getNonPiHuntValue = (
  reviewTestResults,
  claimType,
  typeOfLivestock,
  prices
) => {
  if (reviewTestResults === basicTestResultStatus.positive) {
    return prices[claimType][typeOfLivestock].value[reviewTestResults];
  }

  return prices[claimType][typeOfLivestock].value[reviewTestResults].noPiHunt;
};

const getBeefDairyAmount = (data, claimType, prices) => {
  const {
    typeOfLivestock,
    reviewTestResults,
    piHunt,
    piHuntAllAnimals,
    dateOfVisit,
  } = data;

  if (isVisitDateAfterPIHuntAndDairyGoLive(dateOfVisit)) {
    return getPiHuntValue(
      reviewTestResults,
      piHunt,
      piHuntAllAnimals,
      claimType,
      typeOfLivestock,
      prices
    );
  }

  return getNonPiHuntValue(
    reviewTestResults,
    claimType,
    typeOfLivestock,
    prices
  );
};

export const getAmount = (data) => {
  const { type, typeOfLivestock, reviewTestResults, dateOfVisit } = data;
  const typeOfClaim = type === CLAIM_TYPE.review ? "review" : "followUp";

  const prices = isPostPaymentRateUplift(dateOfVisit)
    ? pricesUplifted
    : pricesOriginal;

  if (
    [TYPE_OF_LIVESTOCK.BEEF, TYPE_OF_LIVESTOCK.DAIRY].includes(
      typeOfLivestock
    ) &&
    reviewTestResults &&
    type === CLAIM_TYPE.endemics
  ) {
    return getBeefDairyAmount(data, typeOfClaim, prices);
  }

  return prices[typeOfClaim][typeOfLivestock].value;
};
