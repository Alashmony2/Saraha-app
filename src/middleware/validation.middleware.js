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
