import db from '../config/database-config.js';

const User = {
  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND deleted_at IS NULL', [
      email,
    ]);
    return rows[0];
  },

  async findById(id) {
    const [rows] = await db.query(
      'SELECT id, email, first_name AS firstName, last_name AS lastName, created_at AS createdAt FROM users WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    return rows[0];
  },

  async create(userData) {
    const { email, passwordHash, firstName, lastName } = userData;
    const [result] = await db.query(
      'INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)',
      [email, passwordHash, firstName, lastName]
    );
    return this.findById(result.insertId);
  },

  async update(id, userData) {
    const { firstName, lastName, email } = userData;
    await db.query('UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ?', [
      firstName,
      lastName,
      email,
      id,
    ]);
    return this.findById(id);
  },

  async updatePassword(id, passwordHash) {
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
  },
};

export default User;
