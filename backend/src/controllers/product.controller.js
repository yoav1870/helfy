import productService from '../services/product.service.js';

const productController = {
  async getAll(req, res, next) {
    try {
      const result = await productService.getAllProducts(req.query);

      res.status(200).json({
        success: true,
        data: result.products,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  async getBySlug(req, res, next) {
    try {
      const product = await productService.getProductBySlug(req.params.slug);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCategories(req, res, next) {
    try {
      const categories = await productService.getAllCategories();

      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default productController;
