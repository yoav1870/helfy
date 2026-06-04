import db from '../config/database-config.js';
import seedCategories from './categories.seed.js';
import seedProducts from './products.seed.js';
import seedUsers from './users.seed.js';

const runSeeds = async () => {
  try {
    // Check if data already exists
    const [categories] = await db.query('SELECT COUNT(*) as count FROM categories');

    if (categories[0].count > 0) {
      console.log('Database already seeded, skipping...');
      return;
    }

    console.log('Seeding database...');

    await seedCategories(db);
    await seedProducts(db);
    await seedUsers(db);

    console.log('✓ Database seeding completed successfully');
  } catch (error) {
    console.error('Seeding error:', error);
    throw error;
  }
};

export default runSeeds;
