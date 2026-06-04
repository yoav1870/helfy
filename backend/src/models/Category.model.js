import db from '../config/database-config.js';

const Category = {
  async findAll() {
    const [rows] = await db.query(
      `SELECT c.*, COUNT(p.id) as product_count 
       FROM categories c 
       LEFT JOIN products p ON c.id = p.category_id AND p.deleted_at IS NULL 
       WHERE c.deleted_at IS NULL 
       GROUP BY c.id 
       ORDER BY c.name ASC`
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query('SELECT * FROM categories WHERE id = ? AND deleted_at IS NULL', [
      id,
    ]);
    return rows[0];
  },
};

export default Category;
