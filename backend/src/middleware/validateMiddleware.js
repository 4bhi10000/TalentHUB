/**
 * Request Validation Middleware using Zod
 * 
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against req.body
 */
function validateRequest(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed; // Use sanitized & coerced data
      next();
    } catch (error) {
      if (error.errors) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation error: Please verify your input.',
          errors: formattedErrors
        });
      }
      next(error);
    }
  };
}

module.exports = validateRequest;
