import Joi from 'joi';

const addToCartSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).required(),
});

const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(0).required(),
});

const validateAddToCart = (req, res, next) => {
  const { error } = addToCartSchema.validate(req.body);
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

const validateUpdateCartItem = (req, res, next) => {
  const { error } = updateCartItemSchema.validate(req.body);
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

export { validateAddToCart, validateUpdateCartItem };
