import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';
import { NotFoundError } from '../utils/errors.js';

const productService = {
  async getAllProducts(filters) {
    return Product.findAll(filters);
  },

  async getProductById(id) {
    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  },

  async getProductBySlug(slug) {
    const product = await Product.findBySlug(slug);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  },

  async getAllCategories() {
    return Category.findAll();
  },
};

export default productService;
