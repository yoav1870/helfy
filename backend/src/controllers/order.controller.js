import orderService from '../services/order.service.js';

const orderController = {
  async createOrder(req, res, next) {
    try {
      const { shippingAddressId, paymentMethod } = req.body;
      const order = await orderService.createOrder(req.userId, shippingAddressId, paymentMethod);

      res.status(201).json({
        success: true,
        data: order,
        message: 'Order created successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async getOrderById(req, res, next) {
    try {
      const order = await orderService.getOrderById(req.userId, req.params.id);

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserOrders(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;

      const result = await orderService.getUserOrders(req.userId, page, limit);

      res.status(200).json({
        success: true,
        data: result.orders,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default orderController;
