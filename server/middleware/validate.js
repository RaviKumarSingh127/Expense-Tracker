const ApiError = require("../utils/ApiError");

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errors = error.details.map((d) => d.message);
    throw new ApiError(400, "Validation failed", errors);
  }
  next();
};

module.exports = validate;
