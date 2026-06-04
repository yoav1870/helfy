export const up = async (db) => {
  await db.query(`
    CREATE TABLE products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      stock INT NOT NULL DEFAULT 0,
      image_url VARCHAR(500),
      slug VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      INDEX idx_category (category_id),
      INDEX idx_price (price),
      INDEX idx_slug (slug)
    )
  `);
};

export const down = async (db) => {
  await db.query('DROP TABLE IF EXISTS products');
};
