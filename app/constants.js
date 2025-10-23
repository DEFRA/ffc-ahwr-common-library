export const STATUS = {
  AGREED: 'AGREED',
  WITHDRAWN: 'WITHDRAWN',
  IN_CHECK: 'IN_CHECK',
  ACCEPTED: 'ACCEPTED',
  NOT_AGREED: 'NOT_AGREED',
  PAID: 'PAID',
  READY_TO_PAY: 'READY_TO_PAY',
  REJECTED: 'REJECTED',
  ON_HOLD: 'ON_HOLD',
  RECOMMENDED_TO_PAY: 'RECOMMENDED_TO_PAY',
  RECOMMENDED_TO_REJECT: 'RECOMMENDED_TO_REJECT',
  AUTHORISED: 'AUTHORISED',
  SENT_TO_FINANCE: 'SENT_TO_FINANCE',
  PAYMENT_HELD: 'PAYMENT_HELD',
};

export const closedViewStatuses = [
  "WITHDRAWN",
  "REJECTED",
  "NOT_AGREED",
  "READY_TO_PAY",
  "PAID",
];

export const claimType = {
  review: "REVIEW",
  endemics: "FOLLOW_UP",
  vetVisits: "VV", // old world claim
};

export const TYPE_OF_LIVESTOCK = {
  BEEF: "beef",
  DAIRY: "dairy",
  PIGS: "pigs",
  SHEEP: "sheep",
};

export const vaccinationStatus = {
  vaccinated: "vaccinated",
  notVaccinated: "notVaccinated",
}

export const basicTestResultStatus = {
  positive: "positive",
  negative: "negative",
}

export const MULTIPLE_HERD_REASONS = {
  separateManagementNeeds: "They have separate management needs",
  uniqueHealthNeeds: "They have unique health needs",
  differentBreed: "They are a different breed",
  differentPurpose: "They are used for another purpose",
  keptSeparate: "They have been kept completely separate",
  other: `Other reasons based on my vet's judgement`,
};

export const PIG_GENETIC_SEQUENCING_VALUES = [
  {
    value: "mlv",
    label: "Modified Live virus (MLV) only",
  },
  {
    value: "prrs1",
    label: "Wild Type (WT) PRRS 1 only",
  },
  {
    value: "prrs1Plus",
    label: "(WT) PRRS 1 plus MLV or recombination",
  },
  {
    value: "recomb",
    label: "Recombination only",
  },
  {
    value: "prrs2",
    label: "Any PRRS 2 (reportable by the laboratory)",
  },
];

export const REDACT_PII_PROGRESS_STATUS = {
  GOT_APPLICATIONS_TO_REDACT: "applications-to-redact",
  DOCUMENT_GENERATOR_REDACTED: "documents",
  SFD_MESSAGE_PROXY_REDACTED: "messages",
  MESSAGE_GENERATOR_REDACTED: "message-generator",
  APPLICATION_STORAGE_REDACTED: "storage-accounts",
  APPLICATION_DATABASE_REDACTED: "database-tables",
  APPLICATION_REDACT_FLAG_ADDED: "redacted-flag",
};

export const REDACT_PII_VALUES = {
  REDACTED_NAME: "REDACTED_NAME",
  REDACTED_EMAIL: "redacted.email@example.com",
  REDACTED_ADDRESS: "REDACTED_ADDRESS",
  REDACTED_ORG_EMAIL: "redacted.org.email@example.com",
  REDACTED_FARMER_NAME: "REDACTED_FARMER_NAME",
  REDACTED_VETS_NAME: "REDACTED_VETS_NAME",
  REDACTED_VET_RCVS_NUMBER: "REDACTED_VET_RCVS_NUMBER",
  REDACTED_LABORATORY_URN: "REDACTED_LABORATORY_URN",
  REDACTED_NOTE: "REDACTED_NOTE",
  REDACTED_MULTI_TYPE_VALUE: "REDACTED_MULTI_TYPE_VALUE",
  REDACTED_HERD_NAME: "REDACTED_HERD_NAME",
  REDACTED_CPH: "REDACTED_CPH",
  REDACTED_CHANGED_BY: "REDACTED_CHANGED_BY",
  REDACTED_EXCEPTION: "REDACTED_EXCEPTION",
  REDACTED_LATEST_ENDEMICS_APPLICATION: "REDACTED_LATEST_ENDEMICS_APPLICATION",
  REDACTED_LATEST_VET_VISIT_APPLICATION:
    "REDACTED_LATEST_VET_VISIT_APPLICATION",
  REDACTED_PREVIOUS_CLAIMS: "REDACTED_PREVIOUS_CLAIMS",
  REDACTED_RELEVANT_REVIEW_FOR_ENDEMICS:
    "REDACTED_RELEVANT_REVIEW_FOR_ENDEMICS",
  REDACTED_HERDS: "REDACTED_HERDS",
  REDACTED_FLAG_DETAIL: "REDACTED_FLAG_DETAIL",
  REDACTED_INVALID_CLAIM_DATA: "REDACTED_INVALID_CLAIM_DATA",
  REDACTED_RAISED_BY: "REDACTED_RAISED_BY",
  REDACTED_MESSAGE: "REDACTED_MESSAGE",
  REDACTED_ORGANISATION_NAME: "REDACTED_ORGANISATION_NAME",
  REDACTED_DELETED_NOTE: "REDACTED_DELETED_NOTE",
  REDACTED_URN_RESULT: "REDACTED_URN_RESULT",
  REDACTED_EVENT_BY: "REDACTED_EVENT_BY",
  REDACTED_FILENAME: "REDACTED_FILENAME",
};

export const RPA_CONTACT_DETAILS = {
  loginUri: "https://www.ruralpayments.service.gov.uk",
  callChargesUri: "https://www.gov.uk/call-charges",
  email: "ruralpayments@defra.gov.uk",
  telephone: "03000 200 301",
};

export const PI_HUNT_AND_DAIRY_FOLLOW_UP_RELEASE_DATE = new Date(
  '2025-01-21T00:00:00'
)

export const APPLICATION_REFERENCE_PREFIX_OLD_WORLD = "AHWR-";
export const APPLICATION_REFERENCE_PREFIX_NEW_WORLD = "IAHW-";

export const UNNAMED_FLOCK = "Unnamed flock";
export const UNNAMED_HERD = "Unnamed herd";

export const AHWR_SCHEME = "ahwr";
export const SUPPORTED_SCHEMES = [AHWR_SCHEME];

