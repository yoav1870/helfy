import db from '../config/database-config.js';

const Product = {
  async findAll(filters = {}) {
    const { page = 1, limit = 20, search, category, minPrice, maxPrice, sort } = filters;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      JOIN categories c ON p.category_id = c.id 
      WHERE p.deleted_at IS NULL
    `;
    const params = [];

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      query += ' AND p.category_id = ?';
      params.push(category);
    }

    if (minPrice !== undefined) {
      query += ' AND p.price >= ?';
      params.push(minPrice);
    }

    if (maxPrice !== undefined) {
      query += ' AND p.price <= ?';
      params.push(maxPrice);
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        query += ' ORDER BY p.price ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY p.price DESC';
        break;
      case 'name_asc':
        query += ' ORDER BY p.name ASC';
        break;
      case 'name_desc':
        query += ' ORDER BY p.name DESC';
        break;
      case 'newest':
        query += ' ORDER BY p.created_at DESC';
        break;
      default:
        query += ' ORDER BY p.id DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM products p WHERE p.deleted_at IS NULL';
    const countParams = [];

    if (search) {
      countQuery += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      countQuery += ' AND p.category_id = ?';
      countParams.push(category);
    }

    if (minPrice !== undefined) {
      countQuery += ' AND p.price >= ?';
      countParams.push(minPrice);
    }

    if (maxPrice !== undefined) {
      countQuery += ' AND p.price <= ?';
      countParams.push(maxPrice);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    return {
      products: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ? AND p.deleted_at IS NULL`,
      [id]
    );
    return rows[0];
  },

  async findBySlug(slug) {
    const [rows] = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       JOIN categories c ON p.category_id = c.id 
       WHERE p.slug = ? AND p.deleted_at IS NULL`,
      [slug]
    );
    return rows[0];
  },
};

export default Product;
