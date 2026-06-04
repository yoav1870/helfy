import Joi from 'joi';

const addressSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  addressLine1: Joi.string().min(5).max(255).required(),
  addressLine2: Joi.string().max(255).allow(''),
  city: Joi.string().min(2).max(100).required(),
  state: Joi.string().min(2).max(100).required(),
  postalCode: Joi.string().min(3).max(20).required(),
  country: Joi.string().min(2).max(100).required(),
  phone: Joi.string().min(10).max(20).allow(''),
  isDefault: Joi.boolean(),
});

const validateAddress = (req, res, next) => {
  const { error } = addressSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation error',
        details: error.details.map((d) => d.message),
      },
    });
  }
  next();
};

export { validateAddress };
