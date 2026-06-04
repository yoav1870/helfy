const seedProducts = async (db) => {
  console.log('Seeding products...');

  const products = [
    // Electronics (category_id: 1)
    {
      category_id: 1,
      name: 'Wireless Headphones',
      description: 'Premium noise-cancelling wireless headphones with 30-hour battery life',
      price: 199.99,
      stock: 50,
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      slug: 'wireless-headphones',
    },
    {
      category_id: 1,
      name: 'Smart Watch',
      description: 'Fitness tracking smartwatch with heart rate monitor',
      price: 299.99,
      stock: 30,
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      slug: 'smart-watch',
    },
    {
      category_id: 1,
      name: 'Laptop Stand',
      description: 'Ergonomic aluminum laptop stand for better posture',
      price: 49.99,
      stock: 100,
      image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
      slug: 'laptop-stand',
    },
    {
      category_id: 1,
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse with precision tracking',
      price: 39.99,
      stock: 75,
      image_url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500',
      slug: 'wireless-mouse',
    },
    {
      category_id: 1,
      name: 'USB-C Hub',
      description: '7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader',
      price: 59.99,
      stock: 60,
      image_url: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500',
      slug: 'usb-c-hub',
    },

    // Clothing (category_id: 2)
    {
      category_id: 2,
      name: 'Classic White T-Shirt',
      description: '100% cotton comfortable white t-shirt',
      price: 24.99,
      stock: 200,
      image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
      slug: 'classic-white-tshirt',
    },
    {
      category_id: 2,
      name: 'Denim Jeans',
      description: 'Classic fit denim jeans in dark wash',
      price: 79.99,
      stock: 150,
      image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
      slug: 'denim-jeans',
    },
    {
      category_id: 2,
      name: 'Leather Jacket',
      description: 'Genuine leather jacket with modern fit',
      price: 299.99,
      stock: 40,
      image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
      slug: 'leather-jacket',
    },
    {
      category_id: 2,
      name: 'Running Shoes',
      description: 'Lightweight running shoes with cushioned sole',
      price: 89.99,
      stock: 80,
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      slug: 'running-shoes',
    },
    {
      category_id: 2,
      name: 'Winter Coat',
      description: 'Warm winter coat with hood and pockets',
      price: 149.99,
      stock: 50,
      image_url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500',
      slug: 'winter-coat',
    },

    // Home & Garden (category_id: 3)
    {
      category_id: 3,
      name: 'Coffee Maker',
      description: 'Programmable coffee maker with thermal carafe',
      price: 79.99,
      stock: 45,
      image_url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500',
      slug: 'coffee-maker',
    },
    {
      category_id: 3,
      name: 'Throw Pillow Set',
      description: 'Set of 4 decorative throw pillows',
      price: 39.99,
      stock: 90,
      image_url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500',
      slug: 'throw-pillow-set',
    },
    {
      category_id: 3,
      name: 'Indoor Plant',
      description: 'Low-maintenance indoor plant in ceramic pot',
      price: 29.99,
      stock: 70,
      image_url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500',
      slug: 'indoor-plant',
    },
    {
      category_id: 3,
      name: 'Table Lamp',
      description: 'Modern LED table lamp with adjustable brightness',
      price: 49.99,
      stock: 55,
      image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500',
      slug: 'table-lamp',
    },
    {
      category_id: 3,
      name: 'Wall Clock',
      description: 'Minimalist wall clock with silent movement',
      price: 34.99,
      stock: 65,
      image_url: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500',
      slug: 'wall-clock',
    },

    // Sports & Outdoors (category_id: 4)
    {
      category_id: 4,
      name: 'Yoga Mat',
      description: 'Non-slip yoga mat with carrying strap',
      price: 29.99,
      stock: 100,
      image_url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
      slug: 'yoga-mat',
    },
    {
      category_id: 4,
      name: 'Camping Tent',
      description: '4-person waterproof camping tent',
      price: 149.99,
      stock: 25,
      image_url: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=500',
      slug: 'camping-tent',
    },
    {
      category_id: 4,
      name: 'Water Bottle',
      description: 'Insulated stainless steel water bottle 32oz',
      price: 24.99,
      stock: 120,
      image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
      slug: 'water-bottle',
    },
    {
      category_id: 4,
      name: 'Resistance Bands Set',
      description: 'Set of 5 resistance bands with different strengths',
      price: 19.99,
      stock: 85,
      image_url: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500',
      slug: 'resistance-bands-set',
    },
    {
      category_id: 4,
      name: 'Hiking Backpack',
      description: '40L hiking backpack with rain cover',
      price: 89.99,
      stock: 40,
      image_url: 'https://images.unsplash.com/photo-1622260614153-03223fb72052?w=500',
      slug: 'hiking-backpack',
    },

    // Books (category_id: 5)
    {
      category_id: 5,
      name: 'The Art of Programming',
      description: 'Comprehensive guide to modern programming practices',
      price: 44.99,
      stock: 60,
      image_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500',
      slug: 'art-of-programming',
    },
    {
      category_id: 5,
      name: 'Mindfulness Guide',
      description: 'Practical guide to mindfulness and meditation',
      price: 19.99,
      stock: 75,
      image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500',
      slug: 'mindfulness-guide',
    },
    {
      category_id: 5,
      name: 'Cookbook Collection',
      description: 'Collection of 500 easy and delicious recipes',
      price: 34.99,
      stock: 50,
      image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500',
      slug: 'cookbook-collection',
    },

    // Toys & Games (category_id: 6)
    {
      category_id: 6,
      name: 'Board Game Classic',
      description: 'Classic strategy board game for family fun',
      price: 29.99,
      stock: 70,
      image_url: 'https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=500',
      slug: 'board-game-classic',
    },
    {
      category_id: 6,
      name: 'Building Blocks Set',
      description: '500-piece building blocks set for creative play',
      price: 39.99,
      stock: 90,
      image_url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500',
      slug: 'building-blocks-set',
    },
    {
      category_id: 6,
      name: 'Puzzle 1000 Pieces',
      description: 'Beautiful landscape 1000-piece jigsaw puzzle',
      price: 24.99,
      stock: 65,
      image_url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500',
      slug: 'puzzle-1000-pieces',
    },
  ];

  for (const product of products) {
    await db.query(
      `INSERT INTO products 
       (category_id, name, description, price, stock, image_url, slug) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        product.category_id,
        product.name,
        product.description,
        product.price,
        product.stock,
        product.image_url,
        product.slug,
      ]
    );
  }

  console.log(`✓ Seeded ${products.length} products`);
};

export default seedProducts;
