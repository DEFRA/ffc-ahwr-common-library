import {
  basicTestResultStatus,
  claimType,
  PI_HUNT_AND_DAIRY_FOLLOW_UP_RELEASE_DATE,
  TYPE_OF_LIVESTOCK,
} from "../constants.js";
import { prices } from "./prices.js";

const isVisitDateAfterPIHuntAndDairyGoLive = (dateOfVisit) => {
  const dateOfVisitParsed = new Date(dateOfVisit);
  if (Number.isNaN(dateOfVisitParsed.getTime())) {
    throw new Error(
      `dateOfVisit must be parsable as a date, value provided: ${dateOfVisit}`
    );
  }

  return dateOfVisitParsed >= PI_HUNT_AND_DAIRY_FOLLOW_UP_RELEASE_DATE;
};

const getPiHuntValue = (
  reviewTestResults,
  piHunt,
  piHuntAllAnimals,
  claimType,
  typeOfLivestock
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

const getNonPiHuntValue = (reviewTestResults, claimType, typeOfLivestock) => {
  if (reviewTestResults === basicTestResultStatus.positive) {
    return prices[claimType][typeOfLivestock].value[reviewTestResults];
  }

  return prices[claimType][typeOfLivestock].value[reviewTestResults].noPiHunt;
};

const getBeefDairyAmount = (data, claimType) => {
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
      typeOfLivestock
    );
  }

  return getNonPiHuntValue(reviewTestResults, claimType, typeOfLivestock);
};

export const getAmount = (data) => {
  const { type, typeOfLivestock, reviewTestResults } = data;
  const typeOfClaim = type === claimType.review ? "review" : "followUp";

  if (
    [TYPE_OF_LIVESTOCK.BEEF, TYPE_OF_LIVESTOCK.DAIRY].includes(
      typeOfLivestock
    ) &&
    reviewTestResults &&
    type === claimType.endemics
  ) {
    return getBeefDairyAmount(data, typeOfClaim);
  }

  return prices[typeOfClaim][typeOfLivestock].value;
};
