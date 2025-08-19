import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";
export const registerSchema = joi.object({
      fullName: joi.string().min(3).max(50).required(),
      email: generalFields.email,
      password: generalFields.password.required(),
      phoneNumber: generalFields.phoneNumber,
      dob: generalFields.dob,
    
}).or("email", "phoneNumber");

export const loginSchema = joi.object({
      email: generalFields.email.required(),
      password: generalFields.password.regex(/^[a-zA-z0-9]{8,30}$/).required(),
      phoneNumber: generalFields.phoneNumber,    
}).or("email", "phoneNumber");

export const resetPasswordSchema = joi.object({
      email:generalFields.email.required(),
      otp:generalFields.otp.required(),
      newPassword:generalFields.password.required(),
      rePassword:generalFields.rePassword("newPassword").required(),
})