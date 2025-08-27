import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const sendMessageSchema = joi
  .object({
    content: joi.string().min(3).max(1000),
    receiver: generalFields.objectId.required(),
    sender: generalFields.objectId,
  })
  .required();
