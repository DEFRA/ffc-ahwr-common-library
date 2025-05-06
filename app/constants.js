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
  uniqueHealthNeeds: 'They have unique health needs to other herds on the farm (if present)',
  differentBreed: 'They are a different breed',
  differentPurpose: 'They are used for another purpose than the other herd(s) (e.g. milking cattle)',
  keptSeparate: 'They have been kept completely separate from any other herds',
  other: 'Other'
}