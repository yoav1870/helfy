import db from '../config/database-config.js';

const Address = {
  async findByUserId(userId) {
    const [rows] = await db.query(
      'SELECT * FROM addresses WHERE user_id = ? AND deleted_at IS NULL ORDER BY is_default DESC, created_at DESC',
      [userId]
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query('SELECT * FROM addresses WHERE id = ? AND deleted_at IS NULL', [
      id,
    ]);
    return rows[0];
  },

  async create(userId, addressData) {
    const {
      firstName,
      lastName,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault,
    } = addressData;

    // If this is default, unset other defaults
    if (isDefault) {
      await db.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
    }

    const [result] = await db.query(
      `INSERT INTO addresses 
       (user_id, first_name, last_name, address_line1, address_line2, city, state, postal_code, country, phone, is_default) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        firstName,
        lastName,
        addressLine1,
        addressLine2 || null,
        city,
        state,
        postalCode,
        country,
        phone || null,
        isDefault || false,
      ]
    );

    return this.findById(result.insertId);
  },

  async update(id, userId, addressData) {
    const {
      firstName,
      lastName,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault,
    } = addressData;

    // If this is default, unset other defaults
    if (isDefault) {
      await db.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ? AND id != ?', [
        userId,
        id,
      ]);
    }

    await db.query(
      `UPDATE addresses 
       SET first_name = ?, last_name = ?, address_line1 = ?, address_line2 = ?, 
           city = ?, state = ?, postal_code = ?, country = ?, phone = ?, is_default = ?
       WHERE id = ? AND user_id = ?`,
      [
        firstName,
        lastName,
        addressLine1,
        addressLine2 || null,
        city,
        state,
        postalCode,
        country,
        phone || null,
        isDefault || false,
        id,
        userId,
      ]
    );

    return this.findById(id);
  },

  async delete(id, userId) {
    await db.query('UPDATE addresses SET deleted_at = NOW() WHERE id = ? AND user_id = ?', [
      id,
      userId,
    ]);
  },
};

export default Address;
