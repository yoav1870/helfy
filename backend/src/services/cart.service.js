import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

const cartService = {
  async getCart(userId) {
    const cart = await Cart.getOrCreate(userId);
    const items = await Cart.getItems(cart.id);

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      id: cart.id,
      items,
      subtotal,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  },

  async addToCart(userId, productId, quantity) {
    // Verify product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (product.stock < quantity) {
      throw new ValidationError('Insufficient stock');
    }

    const cart = await Cart.getOrCreate(userId);
    await Cart.addItem(cart.id, productId, quantity, product.price);

    return this.getCart(userId);
  },

  async updateCartItem(userId, cartItemId, quantity) {
    const cart = await Cart.getOrCreate(userId);
    const items = await Cart.getItems(cart.id);

    const item = items.find((i) => i.id === parseInt(cartItemId, 10));
    if (!item) {
      throw new NotFoundError('Cart item not found');
    }

    // Verify stock if increasing quantity
    if (quantity > item.quantity) {
      const product = await Product.findById(item.product_id);
      if (product.stock < quantity) {
        throw new ValidationError('Insufficient stock');
      }
    }

    await Cart.updateItem(cartItemId, quantity);
    return this.getCart(userId);
  },

  async removeFromCart(userId, cartItemId) {
    await Cart.removeItem(cartItemId);
    return this.getCart(userId);
  },

  async clearCart(userId) {
    const cart = await Cart.getOrCreate(userId);
    await Cart.clear(cart.id);
    return this.getCart(userId);
  },
};

export default cartService;
