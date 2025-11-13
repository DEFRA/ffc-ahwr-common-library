import joi from "joi";

const eventSchema = joi.object({
  body: joi
    .object({
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
    })
    .required(),
  type: joi.string().required(),
  source: joi.string().required(),
});

export const validateEvent = (event, logger) => {
  const { error } = eventSchema.validate(event);

  if (error) {
    logger.error(error, "Event validation error");
    return false;
  }

  return true;
};
