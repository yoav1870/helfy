import express from 'express';
import productController from '../controllers/product.controller.js';
import { validateProductQuery } from '../validators/product.validator.js';

const router = express.Router();

router.get('/products', validateProductQuery, productController.getAll);
router.get('/products/:id(\\d+)', productController.getById);
router.get('/products/slug/:slug', productController.getBySlug);
router.get('/categories', productController.getCategories);

export default router;
