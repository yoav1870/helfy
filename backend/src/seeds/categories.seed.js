const seedCategories = async (db) => {
  console.log('Seeding categories...');

  const categories = [
    {
      name: 'Electronics',
      description: 'Latest gadgets and electronic devices',
      slug: 'electronics',
    },
    {
      name: 'Clothing',
      description: 'Fashion and apparel for all',
      slug: 'clothing',
    },
    {
      name: 'Home & Garden',
      description: 'Everything for your home and garden',
      slug: 'home-garden',
    },
    {
      name: 'Sports & Outdoors',
      description: 'Gear for sports and outdoor activities',
      slug: 'sports-outdoors',
    },
    {
      name: 'Books',
      description: 'Books across all genres',
      slug: 'books',
    },
    {
      name: 'Toys & Games',
      description: 'Fun for all ages',
      slug: 'toys-games',
    },
  ];

  for (const category of categories) {
    await db.query('INSERT INTO categories (name, description, slug) VALUES (?, ?, ?)', [
      category.name,
      category.description,
      category.slug,
    ]);
  }

  console.log(`✓ Seeded ${categories.length} categories`);
};

export default seedCategories;
