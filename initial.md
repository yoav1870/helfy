# Initial Prompt - eCommerce Platform Bootstrap

## Project Overview

You are tasked with building a **complete, production-ready eCommerce platform** from scratch. This is a full-stack application that must be deployable with a single `docker compose up` command.

**Critical Requirements:**

- Follow **engineering-guidelines.md** for ALL coding standards and conventions
- Implement **capability-definitions.md** for ALL features and functionality
- Use **JavaScript only** (NO TypeScript)
- Everything must work with **zero manual steps** after `docker compose up`

---

## Technology Stack

### Core Technologies

- **Language**: JavaScript (ES6+) - NO TypeScript
- **Frontend**: React 18+ with React Router v6
- **Backend**: Node.js with Express.js
- **Database**: MySQL 8+ (using mysql2/promise)
- **Authentication**: JWT with bcryptjs
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Notifications**: react-hot-toast
- **Deployment**: Docker Compose

### Key Packages

**Backend:**

- express
- mysql2
- bcryptjs
- jsonwebtoken
- cookie-parser
- cors
- dotenv
- joi (validation)

**Frontend:**

- react
- react-dom
- react-router-dom (v6)
- axios
- framer-motion
- react-hot-toast
- prop-types
- tailwindcss

---

## Implementation Phases

You will build this application in **3 phases**. Complete each phase fully before moving to the next. Wait for user approval between phases.

---

# PHASE 1: Docker + Database + Migrations + Seed Data

## Objective

Set up the complete infrastructure: Docker containers, database schema, migrations, and seed data. After this phase, running `docker compose up` should start all services with a fully populated database.

## 1.1 Project Structure

Create the following folder structure:

```
/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   └── features/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── constants/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── Dockerfile
│   ├── package.json
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── config/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── migrations/
│   │   ├── seeds/
│   │   └── server.js
│   ├── Dockerfile
│   ├── package.json
│   ├── .eslintrc.json
│   └── .prettierrc
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## 1.2 Docker Configuration

### docker-compose.yml

Create a docker-compose.yml file with 3 services:

```yaml
version: "3.8"

services:
  mysql:
    image: mysql:8.0
    container_name: ecommerce_mysql
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  backend:
    build: ./backend
    container_name: ecommerce_backend
    environment:
      NODE_ENV: development
      PORT: 5000
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      CORS_ORIGIN: http://localhost:3000
    ports:
      - "5000:5000"
    depends_on:
      mysql:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    container_name: ecommerce_frontend
    environment:
      REACT_APP_API_URL: http://localhost:5000/api
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

### Backend Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Run migrations and seeds on startup
CMD npm run migrate && npm run seed && npm start
```

### Frontend Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

# Nginx config for SPA routing
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### .env.example

```bash
# Database
DB_HOST=mysql
DB_PORT=3306
DB_NAME=ecommerce
DB_USER=root
DB_PASSWORD=password123

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# API
CORS_ORIGIN=http://localhost:3000
```

### .gitignore

```
node_modules/
.env
.DS_Store
build/
dist/
*.log
```

## 1.3 Database Configuration

### backend/src/config/database-config.js

```javascript
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
```

## 1.4 Database Migrations

Create migration files in `backend/src/migrations/` that will run automatically on startup.

### backend/src/migrations/runMigrations.js

```javascript
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "../config/database-config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigrations = async () => {
  try {
    console.log("Running migrations...");

    // Create migrations tracking table
    await db.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get all migration files
    const migrationFiles = fs
      .readdirSync(__dirname)
      .filter((file) => file.endsWith(".migration.js"))
      .sort();

    for (const file of migrationFiles) {
      // Check if migration already executed
      const [rows] = await db.query("SELECT * FROM migrations WHERE name = ?", [
        file,
      ]);

      if (rows.length === 0) {
        console.log(`Executing migration: ${file}`);
        const migration = await import(`./${file}`);
        await migration.up(db);
        await db.query("INSERT INTO migrations (name) VALUES (?)", [file]);
        console.log(`✓ Migration ${file} completed`);
      }
    }

    console.log("All migrations completed successfully");
  } catch (error) {
    console.error("Migration error:", error);
    throw error;
  }
};

export default runMigrations;
```

### backend/src/migrations/001_create_users_table.migration.js

```javascript
export const up = async (db) => {
  await db.query(`
    CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP NULL,
      INDEX idx_email (email)
    )
  `);
};

export const down = async (db) => {
  await db.query("DROP TABLE IF EXISTS users");
};
```

### backend/src/migrations/002_create_categories_table.migration.js

```javascript
export const up = async (db) => {
  await db.query(`
    CREATE TABLE categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      slug VARCHAR(100) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP NULL,
      INDEX idx_slug (slug)
    )
  `);
};

export const down = async (db) => {
  await db.query("DROP TABLE IF EXISTS categories");
};
```

### backend/src/migrations/003_create_products_table.migration.js

```javascript
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
  await db.query("DROP TABLE IF EXISTS products");
};
```

### backend/src/migrations/004_create_carts_table.migration.js

```javascript
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
  await db.query("DROP TABLE IF EXISTS carts");
};
```

### backend/src/migrations/005_create_cart_items_table.migration.js

```javascript
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
  await db.query("DROP TABLE IF EXISTS cart_items");
};
```

### backend/src/migrations/006_create_addresses_table.migration.js

```javascript
export const up = async (db) => {
  await db.query(`
    CREATE TABLE addresses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      address_line1 VARCHAR(255) NOT NULL,
      address_line2 VARCHAR(255),
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      postal_code VARCHAR(20) NOT NULL,
      country VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      is_default BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      INDEX idx_user (user_id)
    )
  `);
};

export const down = async (db) => {
  await db.query("DROP TABLE IF EXISTS addresses");
};
```

### backend/src/migrations/007_create_orders_table.migration.js

```javascript
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
  await db.query("DROP TABLE IF EXISTS orders");
};
```

### backend/src/migrations/008_create_order_items_table.migration.js

```javascript
export const up = async (db) => {
  await db.query(`
    CREATE TABLE order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      subtotal DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id),
      INDEX idx_order (order_id)
    )
  `);
};

export const down = async (db) => {
  await db.query("DROP TABLE IF EXISTS order_items");
};
```

## 1.5 Database Seeding

### backend/src/seeds/runSeeds.js

```javascript
import db from "../config/database-config.js";
import seedCategories from "./categories.seed.js";
import seedProducts from "./products.seed.js";
import seedUsers from "./users.seed.js";

const runSeeds = async () => {
  try {
    // Check if data already exists
    const [categories] = await db.query(
      "SELECT COUNT(*) as count FROM categories",
    );

    if (categories[0].count > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    console.log("Seeding database...");

    await seedCategories(db);
    await seedProducts(db);
    await seedUsers(db);

    console.log("✓ Database seeding completed successfully");
  } catch (error) {
    console.error("Seeding error:", error);
    throw error;
  }
};

export default runSeeds;
```

### backend/src/seeds/categories.seed.js

```javascript
const seedCategories = async (db) => {
  console.log("Seeding categories...");

  const categories = [
    {
      name: "Electronics",
      description: "Latest gadgets and electronic devices",
      slug: "electronics",
    },
    {
      name: "Clothing",
      description: "Fashion and apparel for all",
      slug: "clothing",
    },
    {
      name: "Home & Garden",
      description: "Everything for your home and garden",
      slug: "home-garden",
    },
    {
      name: "Sports & Outdoors",
      description: "Gear for sports and outdoor activities",
      slug: "sports-outdoors",
    },
    {
      name: "Books",
      description: "Books across all genres",
      slug: "books",
    },
    {
      name: "Toys & Games",
      description: "Fun for all ages",
      slug: "toys-games",
    },
  ];

  for (const category of categories) {
    await db.query(
      "INSERT INTO categories (name, description, slug) VALUES (?, ?, ?)",
      [category.name, category.description, category.slug],
    );
  }

  console.log(`✓ Seeded ${categories.length} categories`);
};

export default seedCategories;
```

### backend/src/seeds/products.seed.js

```javascript
const seedProducts = async (db) => {
  console.log("Seeding products...");

  const products = [
    // Electronics (category_id: 1)
    {
      category_id: 1,
      name: "Wireless Headphones",
      description:
        "Premium noise-cancelling wireless headphones with 30-hour battery life",
      price: 199.99,
      stock: 50,
      image_url:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
      slug: "wireless-headphones",
    },
    {
      category_id: 1,
      name: "Smart Watch",
      description: "Fitness tracking smartwatch with heart rate monitor",
      price: 299.99,
      stock: 30,
      image_url:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
      slug: "smart-watch",
    },
    {
      category_id: 1,
      name: "Laptop Stand",
      description: "Ergonomic aluminum laptop stand for better posture",
      price: 49.99,
      stock: 100,
      image_url:
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
      slug: "laptop-stand",
    },
    {
      category_id: 1,
      name: "Wireless Mouse",
      description: "Ergonomic wireless mouse with precision tracking",
      price: 39.99,
      stock: 75,
      image_url:
        "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500",
      slug: "wireless-mouse",
    },
    {
      category_id: 1,
      name: "USB-C Hub",
      description: "7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader",
      price: 59.99,
      stock: 60,
      image_url:
        "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500",
      slug: "usb-c-hub",
    },

    // Clothing (category_id: 2)
    {
      category_id: 2,
      name: "Classic White T-Shirt",
      description: "100% cotton comfortable white t-shirt",
      price: 24.99,
      stock: 200,
      image_url:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
      slug: "classic-white-tshirt",
    },
    {
      category_id: 2,
      name: "Denim Jeans",
      description: "Classic fit denim jeans in dark wash",
      price: 79.99,
      stock: 150,
      image_url:
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500",
      slug: "denim-jeans",
    },
    {
      category_id: 2,
      name: "Leather Jacket",
      description: "Genuine leather jacket with modern fit",
      price: 299.99,
      stock: 40,
      image_url:
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500",
      slug: "leather-jacket",
    },
    {
      category_id: 2,
      name: "Running Shoes",
      description: "Lightweight running shoes with cushioned sole",
      price: 89.99,
      stock: 80,
      image_url:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      slug: "running-shoes",
    },
    {
      category_id: 2,
      name: "Winter Coat",
      description: "Warm winter coat with hood and pockets",
      price: 149.99,
      stock: 50,
      image_url:
        "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500",
      slug: "winter-coat",
    },

    // Home & Garden (category_id: 3)
    {
      category_id: 3,
      name: "Coffee Maker",
      description: "Programmable coffee maker with thermal carafe",
      price: 79.99,
      stock: 45,
      image_url:
        "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500",
      slug: "coffee-maker",
    },
    {
      category_id: 3,
      name: "Throw Pillow Set",
      description: "Set of 4 decorative throw pillows",
      price: 39.99,
      stock: 90,
      image_url:
        "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500",
      slug: "throw-pillow-set",
    },
    {
      category_id: 3,
      name: "Indoor Plant",
      description: "Low-maintenance indoor plant in ceramic pot",
      price: 29.99,
      stock: 70,
      image_url:
        "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500",
      slug: "indoor-plant",
    },
    {
      category_id: 3,
      name: "Table Lamp",
      description: "Modern LED table lamp with adjustable brightness",
      price: 49.99,
      stock: 55,
      image_url:
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500",
      slug: "table-lamp",
    },
    {
      category_id: 3,
      name: "Wall Clock",
      description: "Minimalist wall clock with silent movement",
      price: 34.99,
      stock: 65,
      image_url:
        "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500",
      slug: "wall-clock",
    },

    // Sports & Outdoors (category_id: 4)
    {
      category_id: 4,
      name: "Yoga Mat",
      description: "Non-slip yoga mat with carrying strap",
      price: 29.99,
      stock: 100,
      image_url:
        "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500",
      slug: "yoga-mat",
    },
    {
      category_id: 4,
      name: "Camping Tent",
      description: "4-person waterproof camping tent",
      price: 149.99,
      stock: 25,
      image_url:
        "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=500",
      slug: "camping-tent",
    },
    {
      category_id: 4,
      name: "Water Bottle",
      description: "Insulated stainless steel water bottle 32oz",
      price: 24.99,
      stock: 120,
      image_url:
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500",
      slug: "water-bottle",
    },
    {
      category_id: 4,
      name: "Resistance Bands Set",
      description: "Set of 5 resistance bands with different strengths",
      price: 19.99,
      stock: 85,
      image_url:
        "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500",
      slug: "resistance-bands-set",
    },
    {
      category_id: 4,
      name: "Hiking Backpack",
      description: "40L hiking backpack with rain cover",
      price: 89.99,
      stock: 40,
      image_url:
        "https://images.unsplash.com/photo-1622260614153-03223fb72052?w=500",
      slug: "hiking-backpack",
    },

    // Books (category_id: 5)
    {
      category_id: 5,
      name: "The Art of Programming",
      description: "Comprehensive guide to modern programming practices",
      price: 44.99,
      stock: 60,
      image_url:
        "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500",
      slug: "art-of-programming",
    },
    {
      category_id: 5,
      name: "Mindfulness Guide",
      description: "Practical guide to mindfulness and meditation",
      price: 19.99,
      stock: 75,
      image_url:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500",
      slug: "mindfulness-guide",
    },
    {
      category_id: 5,
      name: "Cookbook Collection",
      description: "Collection of 500 easy and delicious recipes",
      price: 34.99,
      stock: 50,
      image_url:
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500",
      slug: "cookbook-collection",
    },

    // Toys & Games (category_id: 6)
    {
      category_id: 6,
      name: "Board Game Classic",
      description: "Classic strategy board game for family fun",
      price: 29.99,
      stock: 70,
      image_url:
        "https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=500",
      slug: "board-game-classic",
    },
    {
      category_id: 6,
      name: "Building Blocks Set",
      description: "500-piece building blocks set for creative play",
      price: 39.99,
      stock: 90,
      image_url:
        "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500",
      slug: "building-blocks-set",
    },
    {
      category_id: 6,
      name: "Puzzle 1000 Pieces",
      description: "Beautiful landscape 1000-piece jigsaw puzzle",
      price: 24.99,
      stock: 65,
      image_url:
        "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500",
      slug: "puzzle-1000-pieces",
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
      ],
    );
  }

  console.log(`✓ Seeded ${products.length} products`);
};

export default seedProducts;
```

### backend/src/seeds/users.seed.js

```javascript
import bcrypt from "bcryptjs";

const seedUsers = async (db) => {
  console.log("Seeding users...");

  const users = [
    {
      email: "john.doe@example.com",
      password: "Password123",
      first_name: "John",
      last_name: "Doe",
    },
    {
      email: "jane.smith@example.com",
      password: "Password123",
      first_name: "Jane",
      last_name: "Smith",
    },
    {
      email: "test@example.com",
      password: "Test1234",
      first_name: "Test",
      last_name: "User",
    },
  ];

  for (const user of users) {
    const password_hash = await bcrypt.hash(user.password, 10);
    await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name) 
       VALUES (?, ?, ?, ?)`,
      [user.email, password_hash, user.first_name, user.last_name],
    );
  }

  console.log(`✓ Seeded ${users.length} users`);
  console.log("Test credentials: test@example.com / Test1234");
};

export default seedUsers;
```

## 1.6 Backend Package Configuration

### backend/package.json

```json
{
  "name": "ecommerce-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "migrate": "node -e \"import('./src/migrations/runMigrations.js').then(m => m.default())\"",
    "seed": "node -e \"import('./src/seeds/runSeeds.js').then(m => m.default())\""
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "joi": "^17.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### backend/.eslintrc.json

```json
{
  "extends": "airbnb-base",
  "env": {
    "node": true,
    "es6": true
  },
  "rules": {
    "no-console": "off",
    "import/extensions": ["error", "always"]
  }
}
```

### backend/.prettierrc

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always"
}
```

## 1.7 Frontend Package Configuration

### frontend/package.json

```json
{
  "name": "ecommerce-frontend",
  "version": "1.0.0",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.16.0",
    "react-scripts": "5.0.1",
    "axios": "^1.5.0",
    "framer-motion": "^10.16.0",
    "react-hot-toast": "^2.4.1",
    "prop-types": "^15.8.1"
  },
  "devDependencies": {
    "tailwindcss": "^3.3.3",
    "autoprefixer": "^10.4.15",
    "postcss": "^8.4.29",
    "eslint-config-airbnb": "^19.0.4",
    "eslint-plugin-react": "^7.33.2"
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

### frontend/tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### frontend/postcss.config.js

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### frontend/.eslintrc.json

```json
{
  "extends": ["airbnb", "airbnb/hooks"],
  "env": {
    "browser": true,
    "es6": true
  },
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/jsx-filename-extension": [1, { "extensions": [".jsx"] }]
  }
}
```

### frontend/.prettierrc

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always"
}
```

## 1.8 Basic Server Setup

### backend/src/server.js

```javascript
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import runMigrations from "./migrations/runMigrations.js";
import runSeeds from "./seeds/runSeeds.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await runMigrations();
    await runSeeds();

    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
```

## 1.9 Basic Frontend Setup

### frontend/public/index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Modern eCommerce Platform" />
    <title>eCommerce Platform</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

### frontend/src/index.jsx

```javascript
import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/globals.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### frontend/src/App.jsx

```javascript
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-900">
          eCommerce Platform
        </h1>
        <p className="text-center text-gray-600 mt-4">
          Phase 1: Infrastructure Complete ✓
        </p>
      </div>
    </div>
  );
}

export default App;
```

### frontend/src/styles/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu",
    "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

## 1.10 README.md

```markdown
# eCommerce Platform

A modern, full-stack eCommerce platform built with React, Node.js, Express, and MySQL.

## Quick Start

1. Clone the repository
2. Copy `.env.example` to `.env`
3. Run: `docker compose up`
4. Access the application:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## Test Credentials

- Email: test@example.com
- Password: Test1234

## Technology Stack

- **Frontend**: React 18, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express
- **Database**: MySQL 8
- **Authentication**: JWT with httpOnly cookies

## Features

- User authentication (signup, login, logout)
- Product catalog with search, filtering, and sorting
- Persistent shopping cart
- Multi-step checkout process
- Order management
- User profile and order history
```

---

## Phase 1 Completion Checklist

Before moving to Phase 2, verify:

- [ ] `docker compose up` starts all 3 services without errors
- [ ] MySQL database is created and all 8 tables exist
- [ ] Database is seeded with categories, products, and test users
- [ ] Backend server starts on port 5000
- [ ] Frontend builds and serves on port 3000
- [ ] Can access http://localhost:3000 and see "Phase 1: Infrastructure Complete ✓"
- [ ] Can access http://localhost:5000/health and get {"status":"ok"}
- [ ] No manual steps required after `docker compose up`

**STOP HERE AND WAIT FOR USER APPROVAL BEFORE PROCEEDING TO PHASE 2**

---

# PHASE 2: Full Backend API

## Objective

Build the complete backend API with all routes, controllers, services, models, middleware, and validators. After this phase, all API endpoints should be functional and testable via Postman/curl.

## 2.1 Error Utilities

### backend/src/utils/errors.js

```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409);
  }
}

export {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
};
```

### backend/src/utils/orderNumber.js

```javascript
const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${timestamp}-${random}`;
};

export default generateOrderNumber;
```

## 2.2 Middleware

### backend/src/middleware/errorHandler.js

```javascript
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Log error for debugging
  console.error("Error:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Don't leak error details in production
  if (process.env.NODE_ENV === "production" && !err.isOperational) {
    message = "Something went wrong";
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};

export default errorHandler;
```

### backend/src/middleware/authenticate.js

```javascript
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../utils/errors.js";

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      throw new UnauthorizedError("Authentication required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      next(new UnauthorizedError("Invalid or expired token"));
    } else {
      next(error);
    }
  }
};

export default authenticate;
```

## 2.3 Validators

### backend/src/validators/auth.validator.js

```javascript
import Joi from "joi";

const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    }),
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const validateSignup = (req, res, next) => {
  const { error } = signupSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Validation error",
        details: error.details.map((d) => d.message),
      },
    });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Validation error",
        details: error.details.map((d) => d.message),
      },
    });
  }
  next();
};

export { validateSignup, validateLogin };
```

### backend/src/validators/product.validator.js

```javascript
import Joi from "joi";

const productQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().allow(""),
  category: Joi.number().integer(),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  sort: Joi.string().valid(
    "price_asc",
    "price_desc",
    "name_asc",
    "name_desc",
    "newest",
  ),
});

const validateProductQuery = (req, res, next) => {
  const { error, value } = productQuerySchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Validation error",
        details: error.details.map((d) => d.message),
      },
    });
  }
  req.query = value;
  next();
};

export { validateProductQuery };
```

### backend/src/validators/cart.validator.js

```javascript
import Joi from "joi";

const addToCartSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).required(),
});

const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(0).required(),
});

const validateAddToCart = (req, res, next) => {
  const { error } = addToCartSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Validation error",
        details: error.details.map((d) => d.message),
      },
    });
  }
  next();
};

const validateUpdateCartItem = (req, res, next) => {
  const { error } = updateCartItemSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Validation error",
        details: error.details.map((d) => d.message),
      },
    });
  }
  next();
};

export { validateAddToCart, validateUpdateCartItem };
```

### backend/src/validators/address.validator.js

```javascript
import Joi from "joi";

const addressSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  addressLine1: Joi.string().min(5).max(255).required(),
  addressLine2: Joi.string().max(255).allow(""),
  city: Joi.string().min(2).max(100).required(),
  state: Joi.string().min(2).max(100).required(),
  postalCode: Joi.string().min(3).max(20).required(),
  country: Joi.string().min(2).max(100).required(),
  phone: Joi.string().min(10).max(20).allow(""),
  isDefault: Joi.boolean(),
});

const validateAddress = (req, res, next) => {
  const { error } = addressSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Validation error",
        details: error.details.map((d) => d.message),
      },
    });
  }
  next();
};

export { validateAddress };
```

## 2.4 Models

### backend/src/models/User.model.js

```javascript
import db from "../config/database-config.js";

const User = {
  async findByEmail(email) {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? AND deleted_at IS NULL",
      [email],
    );
    return rows[0];
  },

  async findById(id) {
    const [rows] = await db.query(
      "SELECT id, email, first_name, last_name, created_at FROM users WHERE id = ? AND deleted_at IS NULL",
      [id],
    );
    return rows[0];
  },

  async create(userData) {
    const { email, passwordHash, firstName, lastName } = userData;
    const [result] = await db.query(
      "INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)",
      [email, passwordHash, firstName, lastName],
    );
    return this.findById(result.insertId);
  },

  async update(id, userData) {
    const { firstName, lastName, email } = userData;
    await db.query(
      "UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ?",
      [firstName, lastName, email, id],
    );
    return this.findById(id);
  },

  async updatePassword(id, passwordHash) {
    await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [
      passwordHash,
      id,
    ]);
  },
};

export default User;
```

### backend/src/models/Product.model.js

```javascript
import db from "../config/database-config.js";

const Product = {
  async findAll(filters = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      minPrice,
      maxPrice,
      sort,
    } = filters;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      JOIN categories c ON p.category_id = c.id 
      WHERE p.deleted_at IS NULL
    `;
    const params = [];

    if (search) {
      query += " AND (p.name LIKE ? OR p.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      query += " AND p.category_id = ?";
      params.push(category);
    }

    if (minPrice !== undefined) {
      query += " AND p.price >= ?";
      params.push(minPrice);
    }

    if (maxPrice !== undefined) {
      query += " AND p.price <= ?";
      params.push(maxPrice);
    }

    // Sorting
    switch (sort) {
      case "price_asc":
        query += " ORDER BY p.price ASC";
        break;
      case "price_desc":
        query += " ORDER BY p.price DESC";
        break;
      case "name_asc":
        query += " ORDER BY p.name ASC";
        break;
      case "name_desc":
        query += " ORDER BY p.name DESC";
        break;
      case "newest":
        query += " ORDER BY p.created_at DESC";
        break;
      default:
        query += " ORDER BY p.id DESC";
    }

    query += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await db.query(query, params);

    // Get total count
    let countQuery =
      "SELECT COUNT(*) as total FROM products p WHERE p.deleted_at IS NULL";
    const countParams = [];

    if (search) {
      countQuery += " AND (p.name LIKE ? OR p.description LIKE ?)";
      countParams.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      countQuery += " AND p.category_id = ?";
      countParams.push(category);
    }

    if (minPrice !== undefined) {
      countQuery += " AND p.price >= ?";
      countParams.push(minPrice);
    }

    if (maxPrice !== undefined) {
      countQuery += " AND p.price <= ?";
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
      [id],
    );
    return rows[0];
  },

  async findBySlug(slug) {
    const [rows] = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       JOIN categories c ON p.category_id = c.id 
       WHERE p.slug = ? AND p.deleted_at IS NULL`,
      [slug],
    );
    return rows[0];
  },
};

export default Product;
```

### backend/src/models/Category.model.js

```javascript
import db from "../config/database-config.js";

const Category = {
  async findAll() {
    const [rows] = await db.query(
      `SELECT c.*, COUNT(p.id) as product_count 
       FROM categories c 
       LEFT JOIN products p ON c.id = p.category_id AND p.deleted_at IS NULL 
       WHERE c.deleted_at IS NULL 
       GROUP BY c.id 
       ORDER BY c.name ASC`,
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(
      "SELECT * FROM categories WHERE id = ? AND deleted_at IS NULL",
      [id],
    );
    return rows[0];
  },
};

export default Category;
```

### backend/src/models/Cart.model.js

```javascript
import db from "../config/database-config.js";

const Cart = {
  async findByUserId(userId) {
    const [rows] = await db.query("SELECT * FROM carts WHERE user_id = ?", [
      userId,
    ]);
    return rows[0];
  },

  async create(userId) {
    const [result] = await db.query("INSERT INTO carts (user_id) VALUES (?)", [
      userId,
    ]);
    return this.findByUserId(userId);
  },

  async getOrCreate(userId) {
    let cart = await this.findByUserId(userId);
    if (!cart) {
      cart = await this.create(userId);
    }
    return cart;
  },

  async getItems(cartId) {
    const [rows] = await db.query(
      `SELECT ci.*, p.name, p.image_url, p.stock, p.slug
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = ? AND p.deleted_at IS NULL`,
      [cartId],
    );
    return rows;
  },

  async addItem(cartId, productId, quantity, price) {
    // Check if item already exists
    const [existing] = await db.query(
      "SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?",
      [cartId, productId],
    );

    if (existing.length > 0) {
      // Update quantity
      await db.query(
        "UPDATE cart_items SET quantity = quantity + ?, price = ? WHERE cart_id = ? AND product_id = ?",
        [quantity, price, cartId, productId],
      );
    } else {
      // Insert new item
      await db.query(
        "INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [cartId, productId, quantity, price],
      );
    }
  },

  async updateItem(cartItemId, quantity) {
    if (quantity === 0) {
      await db.query("DELETE FROM cart_items WHERE id = ?", [cartItemId]);
    } else {
      await db.query("UPDATE cart_items SET quantity = ? WHERE id = ?", [
        quantity,
        cartItemId,
      ]);
    }
  },

  async removeItem(cartItemId) {
    await db.query("DELETE FROM cart_items WHERE id = ?", [cartItemId]);
  },

  async clear(cartId) {
    await db.query("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);
  },
};

export default Cart;
```

### backend/src/models/Address.model.js

```javascript
import db from "../config/database-config.js";

const Address = {
  async findByUserId(userId) {
    const [rows] = await db.query(
      "SELECT * FROM addresses WHERE user_id = ? AND deleted_at IS NULL ORDER BY is_default DESC, created_at DESC",
      [userId],
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(
      "SELECT * FROM addresses WHERE id = ? AND deleted_at IS NULL",
      [id],
    );
    return rows[0];
  },

  async create(userId, addressData) {
    const {
      firstName,
      lastName,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault,
    } = addressData;

    // If this is default, unset other defaults
    if (isDefault) {
      await db.query(
        "UPDATE addresses SET is_default = FALSE WHERE user_id = ?",
        [userId],
      );
    }

    const [result] = await db.query(
      `INSERT INTO addresses 
       (user_id, first_name, last_name, address_line1, address_line2, city, state, postal_code, country, phone, is_default) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        firstName,
        lastName,
        addressLine1,
        addressLine2 || null,
        city,
        state,
        postalCode,
        country,
        phone || null,
        isDefault || false,
      ],
    );

    return this.findById(result.insertId);
  },

  async update(id, userId, addressData) {
    const {
      firstName,
      lastName,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault,
    } = addressData;

    // If this is default, unset other defaults
    if (isDefault) {
      await db.query(
        "UPDATE addresses SET is_default = FALSE WHERE user_id = ? AND id != ?",
        [userId, id],
      );
    }

    await db.query(
      `UPDATE addresses 
       SET first_name = ?, last_name = ?, address_line1 = ?, address_line2 = ?, 
           city = ?, state = ?, postal_code = ?, country = ?, phone = ?, is_default = ?
       WHERE id = ? AND user_id = ?`,
      [
        firstName,
        lastName,
        addressLine1,
        addressLine2 || null,
        city,
        state,
        postalCode,
        country,
        phone || null,
        isDefault || false,
        id,
        userId,
      ],
    );

    return this.findById(id);
  },

  async delete(id, userId) {
    await db.query(
      "UPDATE addresses SET deleted_at = NOW() WHERE id = ? AND user_id = ?",
      [id, userId],
    );
  },
};

export default Address;
```

### backend/src/models/Order.model.js

```javascript
import db from "../config/database-config.js";

const Order = {
  async create(orderData) {
    const {
      userId,
      orderNumber,
      subtotal,
      tax,
      shippingCost,
      total,
      shippingAddressId,
      paymentMethod,
    } = orderData;

    const [result] = await db.query(
      `INSERT INTO orders 
       (user_id, order_number, subtotal, tax, shipping_cost, total, shipping_address_id, payment_method) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        orderNumber,
        subtotal,
        tax,
        shippingCost,
        total,
        shippingAddressId,
        paymentMethod,
      ],
    );

    return this.findById(result.insertId);
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT o.*, 
              a.first_name as shipping_first_name, a.last_name as shipping_last_name,
              a.address_line1, a.address_line2, a.city, a.state, a.postal_code, a.country, a.phone
       FROM orders o
       JOIN addresses a ON o.shipping_address_id = a.id
       WHERE o.id = ?`,
      [id],
    );
    return rows[0];
  },

  async findByUserId(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      `SELECT o.id, o.order_number, o.status, o.total, o.created_at
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset],
    );

    const [countResult] = await db.query(
      "SELECT COUNT(*) as total FROM orders WHERE user_id = ?",
      [userId],
    );

    return {
      orders: rows,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    };
  },

  async addItems(orderId, items) {
    for (const item of items) {
      await db.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?)",
        [orderId, item.productId, item.quantity, item.price, item.subtotal],
      );
    }
  },

  async getItems(orderId) {
    const [rows] = await db.query(
      `SELECT oi.*, p.name, p.image_url, p.slug
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId],
    );
    return rows;
  },

  async updateStatus(orderId, status) {
    await db.query("UPDATE orders SET status = ? WHERE id = ?", [
      status,
      orderId,
    ]);
  },
};

export default Order;
```

## 2.5 Services

### backend/src/services/auth.service.js

```javascript
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import {
  ValidationError,
  UnauthorizedError,
  ConflictError,
} from "../utils/errors.js";

const authService = {
  async signup(userData) {
    const { email, password, firstName, lastName } = userData;

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      passwordHash,
      firstName,
      lastName,
    });

    return user;
  },

  async login(email, password) {
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Remove password from response
    delete user.password_hash;

    return user;
  },

  generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
  },

  setTokenCookie(res, token) {
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  },

  clearTokenCookie(res) {
    res.clearCookie("token");
  },
};

export default authService;
```

### backend/src/services/product.service.js

```javascript
import Product from "../models/Product.model.js";
import { NotFoundError } from "../utils/errors.js";

const productService = {
  async getAllProducts(filters) {
    return Product.findAll(filters);
  },

  async getProductById(id) {
    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    return product;
  },

  async getProductBySlug(slug) {
    const product = await Product.findBySlug(slug);
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    return product;
  },
};

export default productService;
```

### backend/src/services/category.service.js

```javascript
import Category from "../models/Category.model.js";

const categoryService = {
  async getAllCategories() {
    return Category.findAll();
  },

  async getCategoryById(id) {
    return Category.findById(id);
  },
};

export default categoryService;
```

### backend/src/services/cart.service.js

```javascript
import Cart from "../models/Cart.model.js";
import Product from "../models/Product.model.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";

const cartService = {
  async getCart(userId) {
    const cart = await Cart.getOrCreate(userId);
    const items = await Cart.getItems(cart.id);

    // Calculate totals
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return {
      id: cart.id,
      items,
      subtotal,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  },

  async addToCart(userId, productId, quantity) {
    // Verify product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    if (product.stock < quantity) {
      throw new ValidationError("Insufficient stock");
    }

    const cart = await Cart.getOrCreate(userId);
    await Cart.addItem(cart.id, productId, quantity, product.price);

    return this.getCart(userId);
  },

  async updateCartItem(userId, cartItemId, quantity) {
    const cart = await Cart.getOrCreate(userId);
    const items = await Cart.getItems(cart.id);

    const item = items.find((i) => i.id === parseInt(cartItemId, 10));
    if (!item) {
      throw new NotFoundError("Cart item not found");
    }

    // Verify stock if increasing quantity
    if (quantity > item.quantity) {
      const product = await Product.findById(item.product_id);
      if (product.stock < quantity) {
        throw new ValidationError("Insufficient stock");
      }
    }

    await Cart.updateItem(cartItemId, quantity);
    return this.getCart(userId);
  },

  async removeFromCart(userId, cartItemId) {
    await Cart.removeItem(cartItemId);
    return this.getCart(userId);
  },

  async clearCart(userId) {
    const cart = await Cart.getOrCreate(userId);
    await Cart.clear(cart.id);
    return this.getCart(userId);
  },
};

export default cartService;
```

### backend/src/services/order.service.js

```javascript
import Order from "../models/Order.model.js";
import Cart from "../models/Cart.model.js";
import Product from "../models/Product.model.js";
import Address from "../models/Address.model.js";
import generateOrderNumber from "../utils/orderNumber.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";

const TAX_RATE = 0.1; // 10%
const SHIPPING_COST = 10.0; // $10 flat rate

const orderService = {
  async createOrder(userId, shippingAddressId, paymentMethod) {
    // Verify address belongs to user
    const address = await Address.findById(shippingAddressId);
    if (!address || address.user_id !== userId) {
      throw new NotFoundError("Address not found");
    }

    // Get cart items
    const cart = await Cart.getOrCreate(userId);
    const cartItems = await Cart.getItems(cart.id);

    if (cartItems.length === 0) {
      throw new ValidationError("Cart is empty");
    }

    // Verify stock and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.product_id);

      if (!product) {
        throw new NotFoundError(`Product ${item.name} not found`);
      }

      if (product.stock < item.quantity) {
        throw new ValidationError(`Insufficient stock for ${product.name}`);
      }

      const itemSubtotal = item.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: item.product_id,
        quantity: item.quantity,
        price: item.price,
        subtotal: itemSubtotal,
      });
    }

    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax + SHIPPING_COST;

    // Create order
    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      userId,
      orderNumber,
      subtotal,
      tax,
      shippingCost: SHIPPING_COST,
      total,
      shippingAddressId,
      paymentMethod,
    });

    // Add order items
    await Order.addItems(order.id, orderItems);

    // Update product stock
    for (const item of orderItems) {
      await Product.findById(item.productId); // This would need an update method
      // In a real app: await Product.decrementStock(item.productId, item.quantity);
    }

    // Clear cart
    await Cart.clear(cart.id);

    // Return full order details
    return this.getOrderById(userId, order.id);
  },

  async getOrderById(userId, orderId) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (order.user_id !== userId) {
      throw new NotFoundError("Order not found");
    }

    const items = await Order.getItems(orderId);

    return {
      ...order,
      items,
    };
  },

  async getUserOrders(userId, page, limit) {
    return Order.findByUserId(userId, page, limit);
  },
};

export default orderService;
```

### backend/src/services/user.service.js

```javascript
import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import Address from "../models/Address.model.js";
import {
  NotFoundError,
  UnauthorizedError,
  ConflictError,
} from "../utils/errors.js";

const userService = {
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  },

  async updateProfile(userId, userData) {
    const { firstName, lastName, email } = userData;

    // Check if email is taken by another user
    if (email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictError("Email already in use");
      }
    }

    return User.update(userId, { firstName, lastName, email });
  },

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByEmail((await User.findById(userId)).email);

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(userId, passwordHash);
  },

  async getAddresses(userId) {
    return Address.findByUserId(userId);
  },

  async addAddress(userId, addressData) {
    return Address.create(userId, addressData);
  },

  async updateAddress(userId, addressId, addressData) {
    const address = await Address.findById(addressId);
    if (!address || address.user_id !== userId) {
      throw new NotFoundError("Address not found");
    }
    return Address.update(addressId, userId, addressData);
  },

  async deleteAddress(userId, addressId) {
    const address = await Address.findById(addressId);
    if (!address || address.user_id !== userId) {
      throw new NotFoundError("Address not found");
    }
    await Address.delete(addressId, userId);
  },
};

export default userService;
```

## 2.6 Controllers

### backend/src/controllers/auth.controller.js

```javascript
import authService from "../services/auth.service.js";

const authController = {
  async signup(req, res, next) {
    try {
      const { email, password, firstName, lastName } = req.body;

      const user = await authService.signup({
        email,
        password,
        firstName,
        lastName,
      });
      const token = authService.generateToken(user.id);
      authService.setTokenCookie(res, token);

      res.status(201).json({
        success: true,
        data: { user },
        message: "User registered successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await authService.login(email, password);
      const token = authService.generateToken(user.id);
      authService.setTokenCookie(res, token);

      res.status(200).json({
        success: true,
        data: { user },
        message: "Login successful",
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      authService.clearTokenCookie(res);

      res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      next(error);
    }
  },

  async getMe(req, res, next) {
    try {
      const user = await authService.getProfile(req.userId);

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },
};

export default authController;
```

### backend/src/controllers/product.controller.js

```javascript
import productService from "../services/product.service.js";
import categoryService from "../services/category.service.js";

const productController = {
  async getAll(req, res, next) {
    try {
      const result = await productService.getAllProducts(req.query);

      res.status(200).json({
        success: true,
        data: result.products,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  async getBySlug(req, res, next) {
    try {
      const product = await productService.getProductBySlug(req.params.slug);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },
};

const categoryController = {
  async getAll(req, res, next) {
    try {
      const categories = await categoryService.getAllCategories();

      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  },
};

export { productController, categoryController };
```

### backend/src/controllers/cart.controller.js

```javascript
import cartService from "../services/cart.service.js";

const cartController = {
  async getCart(req, res, next) {
    try {
      const cart = await cartService.getCart(req.userId);

      res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  },

  async addToCart(req, res, next) {
    try {
      const { productId, quantity } = req.body;
      const cart = await cartService.addToCart(req.userId, productId, quantity);

      res.status(200).json({
        success: true,
        data: cart,
        message: "Item added to cart",
      });
    } catch (error) {
      next(error);
    }
  },

  async updateCartItem(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const cart = await cartService.updateCartItem(req.userId, id, quantity);

      res.status(200).json({
        success: true,
        data: cart,
        message: "Cart updated",
      });
    } catch (error) {
      next(error);
    }
  },

  async removeFromCart(req, res, next) {
    try {
      const { id } = req.params;
      const cart = await cartService.removeFromCart(req.userId, id);

      res.status(200).json({
        success: true,
        data: cart,
        message: "Item removed from cart",
      });
    } catch (error) {
      next(error);
    }
  },

  async clearCart(req, res, next) {
    try {
      const cart = await cartService.clearCart(req.userId);

      res.status(200).json({
        success: true,
        data: cart,
        message: "Cart cleared",
      });
    } catch (error) {
      next(error);
    }
  },
};

export default cartController;
```

### backend/src/controllers/order.controller.js

```javascript
import orderService from "../services/order.service.js";

const orderController = {
  async createOrder(req, res, next) {
    try {
      const { shippingAddressId, paymentMethod } = req.body;
      const order = await orderService.createOrder(
        req.userId,
        shippingAddressId,
        paymentMethod,
      );

      res.status(201).json({
        success: true,
        data: order,
        message: "Order created successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  async getOrderById(req, res, next) {
    try {
      const order = await orderService.getOrderById(req.userId, req.params.id);

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserOrders(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;

      const result = await orderService.getUserOrders(req.userId, page, limit);

      res.status(200).json({
        success: true,
        data: result.orders,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default orderController;
```

### backend/src/controllers/user.controller.js

```javascript
import userService from "../services/user.service.js";

const userController = {
  async getProfile(req, res, next) {
    try {
      const user = await userService.getProfile(req.userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const { firstName, lastName, email } = req.body;
      const user = await userService.updateProfile(req.userId, {
        firstName,
        lastName,
        email,
      });

      res.status(200).json({
        success: true,
        data: user,
        message: "Profile updated successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      await userService.changePassword(
        req.userId,
        currentPassword,
        newPassword,
      );

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  async getAddresses(req, res, next) {
    try {
      const addresses = await userService.getAddresses(req.userId);

      res.status(200).json({
        success: true,
        data: addresses,
      });
    } catch (error) {
      next(error);
    }
  },

  async addAddress(req, res, next) {
    try {
      const address = await userService.addAddress(req.userId, req.body);

      res.status(201).json({
        success: true,
        data: address,
        message: "Address added successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  async updateAddress(req, res, next) {
    try {
      const address = await userService.updateAddress(
        req.userId,
        req.params.id,
        req.body,
      );

      res.status(200).json({
        success: true,
        data: address,
        message: "Address updated successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteAddress(req, res, next) {
    try {
      await userService.deleteAddress(req.userId, req.params.id);

      res.status(200).json({
        success: true,
        message: "Address deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};

export default userController;
```

## 2.7 Routes

### backend/src/routes/auth.routes.js

```javascript
import express from "express";
import authController from "../controllers/auth.controller.js";
import authenticate from "../middleware/authenticate.js";
import { validateSignup, validateLogin } from "../validators/auth.validator.js";

const router = express.Router();

router.post("/signup", validateSignup, authController.signup);
router.post("/login", validateLogin, authController.login);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.getMe);

export default router;
```

### backend/src/routes/product.routes.js

```javascript
import express from "express";
import {
  productController,
  categoryController,
} from "../controllers/product.controller.js";
import { validateProductQuery } from "../validators/product.validator.js";

const router = express.Router();

router.get("/products", validateProductQuery, productController.getAll);
router.get("/products/:id", productController.getById);
router.get("/products/slug/:slug", productController.getBySlug);
router.get("/categories", categoryController.getAll);

export default router;
```

### backend/src/routes/cart.routes.js

```javascript
import express from "express";
import cartController from "../controllers/cart.controller.js";
import authenticate from "../middleware/authenticate.js";
import {
  validateAddToCart,
  validateUpdateCartItem,
} from "../validators/cart.validator.js";

const router = express.Router();

router.use(authenticate);

router.get("/", cartController.getCart);
router.post("/items", validateAddToCart, cartController.addToCart);
router.put("/items/:id", validateUpdateCartItem, cartController.updateCartItem);
router.delete("/items/:id", cartController.removeFromCart);
router.delete("/", cartController.clearCart);

export default router;
```

### backend/src/routes/order.routes.js

```javascript
import express from "express";
import orderController from "../controllers/order.controller.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.use(authenticate);

router.post("/", orderController.createOrder);
router.get("/", orderController.getUserOrders);
router.get("/:id", orderController.getOrderById);

export default router;
```

### backend/src/routes/user.routes.js

```javascript
import express from "express";
import userController from "../controllers/user.controller.js";
import authenticate from "../middleware/authenticate.js";
import { validateAddress } from "../validators/address.validator.js";

const router = express.Router();

router.use(authenticate);

router.get("/profile", userController.getProfile);
router.put("/profile", userController.updateProfile);
router.put("/password", userController.changePassword);
router.get("/addresses", userController.getAddresses);
router.post("/addresses", validateAddress, userController.addAddress);
router.put("/addresses/:id", validateAddress, userController.updateAddress);
router.delete("/addresses/:id", userController.deleteAddress);

export default router;
```

### backend/src/routes/index.js

```javascript
import express from "express";
import authRoutes from "./auth.routes.js";
import productRoutes from "./product.routes.js";
import cartRoutes from "./cart.routes.js";
import orderRoutes from "./order.routes.js";
import userRoutes from "./user.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/", productRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/users", userRoutes);

export default router;
```

## 2.8 Update Server

### backend/src/server.js (Updated)

```javascript
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import runMigrations from "./migrations/runMigrations.js";
import runSeeds from "./seeds/runSeeds.js";
import routes from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// API routes
app.use("/api", routes);

// Error handler (must be last)
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    await runMigrations();
    await runSeeds();

    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV}`);
      console.log(`✓ API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
```

---

## Phase 2 Completion Checklist

Before moving to Phase 3, verify:

- [ ] All API endpoints are accessible
- [ ] Can signup a new user: `POST /api/auth/signup`
- [ ] Can login: `POST /api/auth/login`
- [ ] Can get products: `GET /api/products`
- [ ] Can get categories: `GET /api/categories`
- [ ] Can add to cart (authenticated): `POST /api/cart/items`
- [ ] Can create order (authenticated): `POST /api/orders`
- [ ] Can get user profile (authenticated): `GET /api/users/profile`
- [ ] Error handling works correctly
- [ ] JWT authentication works with httpOnly cookies

**Test with curl or Postman before proceeding to Phase 3**

**STOP HERE AND WAIT FOR USER APPROVAL BEFORE PROCEEDING TO PHASE 3**

---

# PHASE 3: Full Frontend

## Objective

Build the complete React frontend with all pages, components, routing, state management, and UI/UX features. After this phase, the application should be fully functional end-to-end.

## 3.1 API Service Layer

### frontend/src/services/api.js

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error?.message || "An error occurred";

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = "/login";
    }

    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data,
    });
  },
);

export default api;
```

### frontend/src/services/auth.service.js

```javascript
import api from "./api";

const authService = {
  async signup(userData) {
    const response = await api.post("/auth/signup", userData);
    return response.data;
  },

  async login(credentials) {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  async logout() {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  async getMe() {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

export default authService;
```

### frontend/src/services/product.service.js

```javascript
import api from "./api";

const productService = {
  async getProducts(params = {}) {
    const response = await api.get("/products", { params });
    return response.data;
  },

  async getProductById(id) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async getCategories() {
    const response = await api.get("/categories");
    return response.data;
  },
};

export default productService;
```

### frontend/src/services/cart.service.js

```javascript
import api from "./api";

const cartService = {
  async getCart() {
    const response = await api.get("/cart");
    return response.data;
  },

  async addToCart(productId, quantity) {
    const response = await api.post("/cart/items", { productId, quantity });
    return response.data;
  },

  async updateCartItem(itemId, quantity) {
    const response = await api.put(`/cart/items/${itemId}`, { quantity });
    return response.data;
  },

  async removeFromCart(itemId) {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  async clearCart() {
    const response = await api.delete("/cart");
    return response.data;
  },
};

export default cartService;
```

### frontend/src/services/order.service.js

```javascript
import api from "./api";

const orderService = {
  async createOrder(orderData) {
    const response = await api.post("/orders", orderData);
    return response.data;
  },

  async getOrders(params = {}) {
    const response = await api.get("/orders", { params });
    return response.data;
  },

  async getOrderById(id) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
};

export default orderService;
```

### frontend/src/services/user.service.js

```javascript
import api from "./api";

const userService = {
  async getProfile() {
    const response = await api.get("/users/profile");
    return response.data;
  },

  async updateProfile(userData) {
    const response = await api.put("/users/profile", userData);
    return response.data;
  },

  async changePassword(passwordData) {
    const response = await api.put("/users/password", passwordData);
    return response.data;
  },

  async getAddresses() {
    const response = await api.get("/users/addresses");
    return response.data;
  },

  async addAddress(addressData) {
    const response = await api.post("/users/addresses", addressData);
    return response.data;
  },

  async updateAddress(id, addressData) {
    const response = await api.put(`/users/addresses/${id}`, addressData);
    return response.data;
  },

  async deleteAddress(id) {
    const response = await api.delete(`/users/addresses/${id}`);
    return response.data;
  },
};

export default userService;
```

## 3.2 Context & State Management

### frontend/src/context/AuthContext.jsx

```javascript
import { createContext, useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import authService from "../services/auth.service";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authService.getMe();
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    setUser(response.data.user);
    setIsAuthenticated(true);
    return response;
  };

  const signup = async (userData) => {
    const response = await authService.signup(userData);
    setUser(response.data.user);
    setIsAuthenticated(true);
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
```

### frontend/src/context/CartContext.jsx

```javascript
import { createContext, useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import cartService from "../services/cart.service";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const response = await cartService.getCart();
      setCart(response.data);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const response = await cartService.addToCart(productId, quantity);
      setCart(response.data);
      toast.success("Added to cart");
      return response;
    } catch (error) {
      toast.error(error.message || "Failed to add to cart");
      throw error;
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      const response = await cartService.updateCartItem(itemId, quantity);
      setCart(response.data);
      toast.success("Cart updated");
      return response;
    } catch (error) {
      toast.error(error.message || "Failed to update cart");
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const response = await cartService.removeFromCart(itemId);
      setCart(response.data);
      toast.success("Item removed");
      return response;
    } catch (error) {
      toast.error(error.message || "Failed to remove item");
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      const response = await cartService.clearCart();
      setCart(response.data);
      return response;
    } catch (error) {
      toast.error(error.message || "Failed to clear cart");
      throw error;
    }
  };

  const value = {
    cart,
    isLoading,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    itemCount: cart?.itemCount || 0,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
```

## 3.3 Common Components

### frontend/src/components/common/Button.jsx

```javascript
import PropTypes from "prop-types";
import { motion } from "framer-motion";

const Button = ({
  children,
  variant = "primary",
  size = "medium",
  isLoading = false,
  disabled = false,
  onClick,
  type = "button",
  className = "",
}) => {
  const baseStyles =
    "font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const sizes = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-6 py-3 text-lg",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["primary", "secondary", "outline", "danger"]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  className: PropTypes.string,
};

export default Button;
```

### frontend/src/components/common/Input.jsx

```javascript
import PropTypes from "prop-types";

const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = "",
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
          error ? "border-red-500" : "border-gray-300"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""} ${className}`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Input;
```

### frontend/src/components/common/Card.jsx

```javascript
import PropTypes from "prop-types";
import { motion } from "framer-motion";

const Card = ({ children, className = "", hover = false }) => {
  return (
    <motion.div
      whileHover={
        hover ? { y: -4, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" } : {}
      }
      className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hover: PropTypes.bool,
};

export default Card;
```

### frontend/src/components/common/Spinner.jsx

```javascript
const Spinner = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
};

export default Spinner;
```

### frontend/src/components/common/SkeletonLoader.jsx

```javascript
const SkeletonLoader = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-300 h-48 rounded-t-lg"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
```

## 3.4 Layout Components

### frontend/src/components/layout/Header.jsx

```javascript
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            eCommerce
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link
              to="/products"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Products
            </Link>
            <Link
              to="/categories"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Categories
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative">
              <svg
                className="w-6 h-6 text-gray-700 hover:text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/account"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  {user?.first_name}
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
```

### frontend/src/components/layout/Footer.jsx

```javascript
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">eCommerce</h3>
            <p className="text-gray-400">Your one-stop shop for everything</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>About Us</li>
              <li>Contact</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-gray-400">Email: support@ecommerce.com</p>
            <p className="text-gray-400">Phone: (555) 123-4567</p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 eCommerce. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
```

### frontend/src/components/layout/Layout.jsx

```javascript
import PropTypes from "prop-types";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
```

### frontend/src/components/common/ProtectedRoute.jsx

```javascript
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../../context/AuthContext";
import Spinner from "./Spinner";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
```

## 3.5 Feature Components

### frontend/src/components/features/ProductCard.jsx

```javascript
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Card from "../common/Card";
import Button from "../common/Button";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    await addToCart(product.id, 1);
  };

  return (
    <Card hover className="h-full flex flex-col">
      <Link to={`/products/${product.id}`}>
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-600">
            ${product.price.toFixed(2)}
          </span>
          <Button size="small" onClick={handleAddToCart}>
            Add to Cart
          </Button>
        </div>
        {product.stock < 10 && product.stock > 0 && (
          <p className="text-orange-500 text-sm mt-2">
            Only {product.stock} left!
          </p>
        )}
        {product.stock === 0 && (
          <p className="text-red-500 text-sm mt-2">Out of stock</p>
        )}
      </div>
    </Card>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    image_url: PropTypes.string.isRequired,
    stock: PropTypes.number.isRequired,
  }).isRequired,
};

export default ProductCard;
```

## 3.6 Pages

### frontend/src/pages/HomePage.jsx

```javascript
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../components/common/Button";

const HomePage = () => {
  return (
    <div>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to eCommerce
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Discover amazing products at unbeatable prices. Shop now and enjoy
          fast, free shipping!
        </p>
        <Link to="/products">
          <Button size="large">Shop Now</Button>
        </Link>
      </motion.section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center p-6 bg-white rounded-lg shadow-md"
        >
          <div className="text-4xl mb-4">🚚</div>
          <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
          <p className="text-gray-600">On all orders over $50</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center p-6 bg-white rounded-lg shadow-md"
        >
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
          <p className="text-gray-600">100% secure transactions</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center p-6 bg-white rounded-lg shadow-md"
        >
          <div className="text-4xl mb-4">⭐</div>
          <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
          <p className="text-gray-600">Curated selection of the best</p>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;
```

### frontend/src/pages/ProductsPage.jsx

```javascript
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import productService from "../services/product.service";
import ProductCard from "../components/features/ProductCard";
import SkeletonLoader from "../components/common/SkeletonLoader";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    sort: "newest",
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productService.getProducts(filters);
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Products</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Filters</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search products..."
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Price Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="Min"
                  className="w-1/2 px-3 py-2 border rounded-lg"
                />
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Max"
                  className="w-1/2 px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <select
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A-Z</option>
                <option value="name_desc">Name: Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <SkeletonLoader key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No products found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
```

### frontend/src/pages/LoginPage.jsx

```javascript
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData);
      toast.success("Login successful!");
      navigate("/");
    } catch (error) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-lg shadow-md"
      >
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>

        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <Button type="submit" isLoading={isLoading} className="w-full">
            Login
          </Button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
```

### frontend/src/pages/SignupPage.jsx

```javascript
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signup(formData);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-lg shadow-md"
      >
        <h1 className="text-3xl font-bold text-center mb-6">Sign Up</h1>

        <form onSubmit={handleSubmit}>
          <Input
            label="First Name"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />

          <Input
            label="Last Name"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <Button type="submit" isLoading={isLoading} className="w-full">
            Sign Up
          </Button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignupPage;
```

## 3.7 App Router

### frontend/src/App.jsx (Updated)

```javascript
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-right" />
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              {/* Add more routes as needed */}
            </Routes>
          </Layout>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

---

## Phase 3 Completion Checklist

Before final deployment, verify:

- [ ] All pages render correctly
- [ ] Can navigate between pages
- [ ] Can signup and login
- [ ] Can view products with filters
- [ ] Can add products to cart
- [ ] Cart icon shows item count
- [ ] Authentication persists on refresh
- [ ] Protected routes redirect to login
- [ ] Toast notifications work
- [ ] Responsive design works on mobile
- [ ] All animations work smoothly

**CONGRATULATIONS! Your eCommerce platform is complete!**

Access at: http://localhost:3000
