export const up = async (db) => {
  await db.query(`
    CREATE TABLE carts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      INDEX idx_user (user_id)
    )
  `);
};

export const down = async (db) => {
  await db.query('DROP TABLE IF EXISTS carts');
};
