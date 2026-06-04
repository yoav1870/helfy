export const up = async (db) => {
  await db.query(`
    CREATE TABLE orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      order_number VARCHAR(50) UNIQUE NOT NULL,
      status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
      subtotal DECIMAL(10, 2) NOT NULL,
      tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
      shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
      total DECIMAL(10, 2) NOT NULL,
      shipping_address_id INT NOT NULL,
      payment_method VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (shipping_address_id) REFERENCES addresses(id),
      INDEX idx_user (user_id),
      INDEX idx_order_number (order_number),
      INDEX idx_status (status)
    )
  `);
};

export const down = async (db) => {
  await db.query('DROP TABLE IF EXISTS orders');
};
