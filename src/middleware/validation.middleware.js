import joi from 'joi'
export const isValid = (schema) => {
  return (req, res, next) => {
    const { value, error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      let errMessages = error.details.map((err) => {
        return err.message;
      });
      errMessages = errMessages.join(", ");
      throw new Error(errMessages, { cause: 400 });
    }
    next();
  };
};

export const generalFields = {
  email:joi.string().email(),
  phoneNumber:joi.string().length(11),
  password:joi.string().min(8),
  name:joi.string().min(3).max(30),
  dob:joi.date(),
  otp:joi.string().length(5),
  rePassword:(ref)=> joi.string().min(8).valid(joi.ref(ref)),
}
