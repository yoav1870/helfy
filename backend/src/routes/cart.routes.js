import express from 'express';
import cartController from '../controllers/cart.controller.js';
import authenticate from '../middleware/authenticate.js';
import { validateAddToCart, validateUpdateCartItem } from '../validators/cart.validator.js';

const router = express.Router();

router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/items', validateAddToCart, cartController.addToCart);
router.put('/items/:itemId', validateUpdateCartItem, cartController.updateCartItem);
router.delete('/items/:itemId', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

export default router;
