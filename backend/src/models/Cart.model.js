import db from '../config/database-config.js';

const Cart = {
  async findByUserId(userId) {
    const [rows] = await db.query('SELECT * FROM carts WHERE user_id = ?', [userId]);
    return rows[0];
  },

  async create(userId) {
    const [result] = await db.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
    return this.findByUserId(userId);
  },

  async getOrCreate(userId) {
    let cart = await this.findByUserId(userId);
    if (!cart) {
      cart = await this.create(userId);
    }
    return cart;
  },

  async getItems(cartId) {
    const [rows] = await db.query(
      `SELECT ci.*, p.name, p.image_url, p.stock, p.slug
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = ? AND p.deleted_at IS NULL`,
      [cartId]
    );
    return rows;
  },

  async addItem(cartId, productId, quantity, price) {
    // Check if item already exists
    const [existing] = await db.query(
      'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, productId]
    );

    if (existing.length > 0) {
      // Update quantity
      await db.query(
        'UPDATE cart_items SET quantity = quantity + ?, price = ? WHERE cart_id = ? AND product_id = ?',
        [quantity, price, cartId, productId]
      );
    } else {
      // Insert new item
      await db.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [cartId, productId, quantity, price]
      );
    }
  },

  async updateItem(cartItemId, quantity) {
    if (quantity === 0) {
      await db.query('DELETE FROM cart_items WHERE id = ?', [cartItemId]);
    } else {
      await db.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, cartItemId]);
    }
  },

  async removeItem(cartItemId) {
    await db.query('DELETE FROM cart_items WHERE id = ?', [cartItemId]);
  },

  async clear(cartId) {
    await db.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
  },
};

export default Cart;
