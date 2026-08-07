const ApiError = require('../../../shared/utils/ApiError');

// Generic Zod-schema validation middleware factory
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, 'Validation failed', result.error.flatten().fieldErrors);
  }
  req.body = result.data;
  next();
};

module.exports = validate;
