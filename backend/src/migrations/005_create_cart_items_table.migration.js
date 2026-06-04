export const up = async (db) => {
  await db.query(`
    CREATE TABLE cart_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cart_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      price DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id),
      INDEX idx_cart (cart_id),
      INDEX idx_product (product_id),
      UNIQUE KEY unique_cart_product (cart_id, product_id)
    )
  `);
};

export const down = async (db) => {
  await db.query('DROP TABLE IF EXISTS cart_items');
};
