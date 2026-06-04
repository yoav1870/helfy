import Order from '../models/Order.model.js';
import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';
import Address from '../models/Address.model.js';
import generateOrderNumber from '../utils/orderNumber.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

const TAX_RATE = 0.1; // 10%
const SHIPPING_COST = 10.0; // $10 flat rate

const orderService = {
  async createOrder(userId, shippingAddressId, paymentMethod) {
    // Verify address belongs to user
    const address = await Address.findById(shippingAddressId);
    if (!address || address.user_id !== userId) {
      throw new NotFoundError('Address not found');
    }

    // Get cart items
    const cart = await Cart.getOrCreate(userId);
    const cartItems = await Cart.getItems(cart.id);

    if (cartItems.length === 0) {
      throw new ValidationError('Cart is empty');
    }

    // Verify stock and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.product_id);

      if (!product) {
        throw new NotFoundError(`Product ${item.name} not found`);
      }

      if (product.stock < item.quantity) {
        throw new ValidationError(`Insufficient stock for ${product.name}`);
      }

      const itemSubtotal = item.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: item.product_id,
        quantity: item.quantity,
        price: item.price,
        subtotal: itemSubtotal,
      });
    }

    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax + SHIPPING_COST;

    // Create order
    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      userId,
      orderNumber,
      subtotal,
      tax,
      shippingCost: SHIPPING_COST,
      total,
      shippingAddressId,
      paymentMethod,
    });

    // Add order items
    await Order.addItems(order.id, orderItems);

    // Clear cart
    await Cart.clear(cart.id);

    // Return full order details
    return this.getOrderById(userId, order.id);
  },

  async getOrderById(userId, orderId) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.user_id !== userId) {
      throw new NotFoundError('Order not found');
    }

    const items = await Order.getItems(orderId);

    return {
      ...order,
      items,
    };
  },

  async getUserOrders(userId, page, limit) {
    return Order.findByUserId(userId, page, limit);
  },
};

export default orderService;
