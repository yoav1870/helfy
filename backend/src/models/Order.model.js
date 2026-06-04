import db from '../config/database-config.js';

const Order = {
  async create(orderData) {
    const {
      userId,
      orderNumber,
      subtotal,
      tax,
      shippingCost,
      total,
      shippingAddressId,
      paymentMethod,
    } = orderData;

    const [result] = await db.query(
      `INSERT INTO orders 
       (user_id, order_number, subtotal, tax, shipping_cost, total, shipping_address_id, payment_method) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, orderNumber, subtotal, tax, shippingCost, total, shippingAddressId, paymentMethod]
    );

    return this.findById(result.insertId);
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT o.*, 
              a.first_name as shipping_first_name, a.last_name as shipping_last_name,
              a.address_line1, a.address_line2, a.city, a.state, a.postal_code, a.country, a.phone
       FROM orders o
       JOIN addresses a ON o.shipping_address_id = a.id
       WHERE o.id = ?`,
      [id]
    );
    return rows[0];
  },

  async findByUserId(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      `SELECT o.id, o.order_number, o.status, o.total, o.created_at
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    const [countResult] = await db.query('SELECT COUNT(*) as total FROM orders WHERE user_id = ?', [
      userId,
    ]);

    return {
      orders: rows,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    };
  },

  async addItems(orderId, items) {
    for (const item of items) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, item.price, item.subtotal]
      );
    }
  },

  async getItems(orderId) {
    const [rows] = await db.query(
      `SELECT oi.*, p.name, p.image_url, p.slug
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );
    return rows;
  },

  async updateStatus(orderId, status) {
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
  },
};

export default Order;
