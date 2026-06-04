import express from 'express';
import orderController from '../controllers/order.controller.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();

router.use(authenticate);

router.post('/', orderController.createOrder);
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);

export default router;
