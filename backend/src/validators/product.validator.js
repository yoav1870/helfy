import Joi from 'joi';

const productQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().allow(''),
  category: Joi.number().integer(),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  sort: Joi.string().valid('price_asc', 'price_desc', 'name_asc', 'name_desc', 'newest'),
});

const validateProductQuery = (req, res, next) => {
  const { error, value } = productQuerySchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation error',
        details: error.details.map((d) => d.message),
      },
    });
  }
  req.query = value;
  next();
};

export { validateProductQuery };
