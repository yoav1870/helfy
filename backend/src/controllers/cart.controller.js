import cartService from '../services/cart.service.js';

const cartController = {
  async getCart(req, res, next) {
    try {
      const cart = await cartService.getCart(req.userId);

      res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  },

  async addToCart(req, res, next) {
    try {
      const { productId, quantity } = req.body;
      const cart = await cartService.addToCart(req.userId, productId, quantity);

      res.status(200).json({
        success: true,
        data: cart,
        message: 'Item added to cart',
      });
    } catch (error) {
      next(error);
    }
  },

  async updateCartItem(req, res, next) {
    try {
      const { quantity } = req.body;
      const cart = await cartService.updateCartItem(req.userId, req.params.itemId, quantity);

      res.status(200).json({
        success: true,
        data: cart,
        message: 'Cart updated',
      });
    } catch (error) {
      next(error);
    }
  },

  async removeFromCart(req, res, next) {
    try {
      const cart = await cartService.removeFromCart(req.userId, req.params.itemId);

      res.status(200).json({
        success: true,
        data: cart,
        message: 'Item removed from cart',
      });
    } catch (error) {
      next(error);
    }
  },

  async clearCart(req, res, next) {
    try {
      const cart = await cartService.clearCart(req.userId);

      res.status(200).json({
        success: true,
        data: cart,
        message: 'Cart cleared',
      });
    } catch (error) {
      next(error);
    }
  },
};

export default cartController;
