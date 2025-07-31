export const CLAIM_STATUS = {
  AGREED: 1,
  WITHDRAWN: 2,
  IN_CHECK: 5,
  ACCEPTED: 6,
  NOT_AGREED: 7,
  PAID: 8,
  READY_TO_PAY: 9,
  REJECTED: 10,
  ON_HOLD: 11,
  RECOMMENDED_TO_PAY: 12,
  RECOMMENDED_TO_REJECT: 13,
  AUTHORISED: 14,
  SENT_TO_FINANCE: 15,
  PAYMENT_HELD: 16
}

export const TYPE_OF_LIVESTOCK = {
  BEEF: "beef",
  DAIRY: "dairy",
  PIGS: "pigs",
  SHEEP: "sheep"
}

export const MULTIPLE_HERD_REASONS = {
  separateManagementNeeds: 'They have separate management needs',
  uniqueHealthNeeds: 'They have unique health needs',
  differentBreed: 'They are a different breed',
  differentPurpose: 'They are used for another purpose',
  keptSeparate: 'They have been kept completely separate',
  other: `Other reasons based on my vet's judgement`
}

export const PIG_GENETIC_SEQUENCING_VALUES =  [
  {
    value: "mlv",
    label: "Modified Live virus (MLV) only"
  },
  {
    value: "prrs1",
    label: "Wild Type (WT) PRRS 1 only"
  },
  {
    value: "prrs1Plus",
    label: "(WT) PRRS 1 plus MLV or recombination"
  },
  {
    value: "recomb",
    label: "Recombination only"
  },
  {
    value: "prrs2",
    label: "Any PRRS 2 (reportable by the laboratory)"
  }
]

export const REDACT_PII_VALUES = {
  REDACTED_NAME: 'REDACTED_NAME',
  REDACTED_EMAIL: 'redacted.email@example.com',
  REDACTED_ADDRESS: 'REDACTED_ADDRESS',
  REDACTED_ORG_EMAIL: 'redacted.org.email@example.com',
  REDACTED_FARMER_NAME: 'REDACTED_FARMER_NAME',
  REDACTED_VETS_NAME: 'REDACTED_VETS_NAME',
  REDACTED_VET_RCVS_NUMBER: 'REDACTED_VET_RCVS_NUMBER',
  REDACTED_LABORATORY_URN: 'REDACTED_LABORATORY_URN',
  REDACTED_NOTE: 'REDACTED_NOTE',
  REDACTED_MULTI_TYPE_VALUE: 'REDACTED_MULTI_TYPE_VALUE',
  REDACTED_HERD_NAME: 'REDACTED_HERD_NAME',
  REDACTED_CPH: 'REDACTED_CPH',
  REDACTED_CHANGED_BY: 'REDACTED_CHANGED_BY',
  REDACTED_EXCEPTION: 'REDACTED_EXCEPTION',
  REDACTED_LATEST_ENDEMICS_APPLICATION: 'REDACTED_LATEST_ENDEMICS_APPLICATION',
  REDACTED_LATEST_VET_VISIT_APPLICATION: 'REDACTED_LATEST_VET_VISIT_APPLICATION',
  REDACTED_PREVIOUS_CLAIMS: 'REDACTED_PREVIOUS_CLAIMS',
  REDACTED_RELEVANT_REVIEW_FOR_ENDEMICS: 'REDACTED_RELEVANT_REVIEW_FOR_ENDEMICS',
  REDACTED_HERDS: 'REDACTED_HERDS',
  REDACTED_FLAG_DETAIL: 'REDACTED_FLAG_DETAIL',
  REDACTED_INVALID_CLAIM_DATA: 'REDACTED_INVALID_CLAIM_DATA',
  REDACTED_RAISED_BY: 'REDACTED_RAISED_BY',
  REDACTED_MESSAGE: 'REDACTED_MESSAGE',
  REDACTED_ORGANISATION_NAME: 'REDACTED_ORGANISATION_NAME',
  REDACTED_DELETED_NOTE: 'REDACTED_DELETED_NOTE',
  REDACTED_URN_RESULT: 'REDACTED_URN_RESULT',
}

export const RPA_CONTACT_DETAILS = {
  loginUri: 'https://www.ruralpayments.service.gov.uk',
  callChargesUri: 'https://www.gov.uk/call-charges',
  email: 'ruralpayments@defra.gov.uk',
  telephone: '03000 200 301'
}
