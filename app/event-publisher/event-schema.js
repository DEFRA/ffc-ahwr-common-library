import joi from "joi";

const eventSchema = joi.object({
  name: joi.string().required(),
  properties: joi.object({
    id: joi.string().required(),
    sbi: joi.string().required(),
    cph: joi.string().required(),
    checkpoint: joi.string().required(),
    status: joi.string().required(),
    reference: joi.string().optional(),
    action: joi.object({
      type: joi.string().required(),
      message: joi.string().required(),
      data: joi.object(),
      error: joi.string().allow(null, ""),
      raisedBy: joi.string().required(),
      raisedOn: joi.string().optional(),
    }),
  }),
});

export const validateEvent = (event) => {
  const { error } = eventSchema.validate(event);

  if (error) {
    console.log("Event validation error", error);
    return false;
  }

  return true;
};
