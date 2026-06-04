import bcrypt from 'bcryptjs';

const seedUsers = async (db) => {
  console.log('Seeding users...');

  const users = [
    {
      email: 'john.doe@example.com',
      password: 'Password123',
      first_name: 'John',
      last_name: 'Doe',
    },
    {
      email: 'jane.smith@example.com',
      password: 'Password123',
      first_name: 'Jane',
      last_name: 'Smith',
    },
    {
      email: 'test@example.com',
      password: 'Test1234',
      first_name: 'Test',
      last_name: 'User',
    },
  ];

  for (const user of users) {
    const password_hash = await bcrypt.hash(user.password, 10);
    await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name) 
       VALUES (?, ?, ?, ?)`,
      [user.email, password_hash, user.first_name, user.last_name]
    );
  }

  console.log(`✓ Seeded ${users.length} users`);
  console.log('Test credentials: test@example.com / Test1234');
};

export default seedUsers;
