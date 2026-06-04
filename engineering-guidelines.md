# Engineering Guidelines

## Overview

This document defines the engineering standards, conventions, and best practices that must be consistently followed throughout the eCommerce platform development. These guidelines ensure code quality, maintainability, and consistency across the entire codebase.

---

## Technology Stack

### Core Technologies

- **Language:** JavaScript (ES6+) - **NO TypeScript**
- **Frontend:** React.js 18+
- **Backend:** Node.js with Express.js
- **Database:** MySQL 8+
- **Authentication:** JWT (JSON Web Tokens)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Deployment:** Docker Compose

### Development Tools

- **Linting:** ESLint with Airbnb configuration
- **Formatting:** Prettier
- **Version Control:** Git

---

## Project Structure

### Monorepo Architecture

The project follows a monorepo structure with clear separation between frontend and backend:

```
/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Reusable UI components
│   │   │   ├── layout/          # Layout components (Header, Footer, etc.)
│   │   │   └── features/        # Feature-specific components
│   │   ├── pages/               # Page components (route-level)
│   │   ├── hooks/               # Custom React hooks
│   │   ├── context/             # React Context providers
│   │   ├── services/            # API service layer
│   │   ├── utils/               # Utility functions
│   │   ├── constants/           # Constants and configuration
│   │   ├── styles/              # Global styles and Tailwind config
│   │   ├── App.jsx              # Root component
│   │   └── index.jsx            # Entry point
│   ├── Dockerfile
│   ├── package.json
│   └── .eslintrc.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/         # Request handlers
│   │   ├── services/            # Business logic layer
│   │   ├── models/              # Database models
│   │   ├── middleware/          # Express middleware
│   │   ├── routes/              # API route definitions
│   │   ├── config/              # Configuration files
│   │   ├── utils/               # Utility functions
│   │   ├── validators/          # Input validation schemas
│   │   └── migrations/          # Database migrations
│   ├── Dockerfile
│   ├── package.json
│   └── .eslintrc.json
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## Naming Conventions

### General Rules

- **Variables & Functions:** `camelCase`

  ```javascript
  const userName = "John";
  function getUserData() {}
  ```

- **React Components:** `PascalCase` (file names must match component names)

  ```javascript
  // File: ProductCard.jsx
  function ProductCard() {}
  export default ProductCard;
  ```

- **Constants:** `UPPER_SNAKE_CASE`

  ```javascript
  const API_BASE_URL = "http://localhost:3000";
  const MAX_RETRY_ATTEMPTS = 3;
  ```

- **Private Functions/Methods:** Prefix with underscore `_camelCase`
  ```javascript
  function _validateInput(data) {}
  ```

### File Naming

- **React Components:** `PascalCase.jsx` (e.g., `ProductCard.jsx`, `UserProfile.jsx`)
- **Utility Files:** `camelCase.js` (e.g., `authHelper.js`, `formatDate.js`)
- **Configuration Files:** `kebab-case.js` (e.g., `database-config.js`, `jwt-config.js`)
- **Route Files:** `camelCase.routes.js` (e.g., `auth.routes.js`, `products.routes.js`)
- **Controller Files:** `camelCase.controller.js` (e.g., `auth.controller.js`)
- **Service Files:** `camelCase.service.js` (e.g., `user.service.js`)
- **Model Files:** `PascalCase.model.js` (e.g., `User.model.js`, `Product.model.js`)

### API Endpoints

- Use **kebab-case** for URL paths
- Use **plural nouns** for resource collections
- Use **RESTful conventions**

```
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
GET    /api/users/:id/order-history
POST   /api/auth/login
POST   /api/auth/signup
```

---

## Code Style Rules

### ESLint Configuration

- **Base Config:** Airbnb JavaScript Style Guide
- **Indentation:** 2 spaces (no tabs)
- **Quotes:** Single quotes for strings
- **Semicolons:** Required
- **Line Length:** Maximum 100 characters
- **Trailing Commas:** Required in multiline objects/arrays

### Prettier Configuration

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

### JavaScript Best Practices

#### 1. Use Modern ES6+ Features

```javascript
// ✅ Good - Use arrow functions
const getUser = (id) => userService.findById(id);

// ✅ Good - Use destructuring
const { name, email } = user;

// ✅ Good - Use template literals
const message = `Welcome, ${userName}!`;

// ✅ Good - Use async/await over promises
async function fetchUserData(id) {
  const user = await userService.getUser(id);
  return user;
}

// ❌ Bad - Avoid var
var count = 0; // Use const or let

// ❌ Bad - Avoid function keyword for simple functions
function add(a, b) {
  return a + b;
} // Use arrow function
```

#### 2. Prefer Const Over Let

```javascript
// ✅ Good
const API_URL = "http://localhost:3000";
const users = [];

// ❌ Bad - Only use let when reassignment is necessary
let API_URL = "http://localhost:3000";
```

#### 3. Destructuring

```javascript
// ✅ Good
const { firstName, lastName, email } = req.body;

// ❌ Bad
const firstName = req.body.firstName;
const lastName = req.body.lastName;
const email = req.body.email;
```

#### 4. Async/Await Over Promises

```javascript
// ✅ Good
async function getProducts() {
  try {
    const products = await productService.findAll();
    return products;
  } catch (error) {
    throw error;
  }
}

// ❌ Bad
function getProducts() {
  return productService
    .findAll()
    .then((products) => products)
    .catch((error) => {
      throw error;
    });
}
```

---

## React Guidelines

### Component Structure

#### Functional Components Only

```javascript
// ✅ Good - Functional component with hooks
import React, { useState, useEffect } from "react";

function ProductCard({ product }) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Side effects here
  }, []);

  return <div className="product-card">{/* JSX */}</div>;
}

export default ProductCard;

// ❌ Bad - Class components
class ProductCard extends React.Component {}
```

#### Component File Template

```javascript
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

function ComponentName({ prop1, prop2 }) {
  // 1. State declarations
  const [state, setState] = useState(initialValue);

  // 2. Custom hooks
  const customHook = useCustomHook();

  // 3. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // 4. Event handlers
  const handleClick = () => {
    // Handler logic
  };

  // 5. Helper functions
  const helperFunction = () => {
    // Helper logic
  };

  // 6. Render
  return <div>{/* JSX */}</div>;
}

// PropTypes validation
ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
};

// Default props
ComponentName.defaultProps = {
  prop2: 0,
};

export default ComponentName;
```

### React Best Practices

#### 1. Component Composition Over Inheritance

```javascript
// ✅ Good - Composition
function Button({ children, variant, ...props }) {
  return (
    <button className={`btn btn-${variant}`} {...props}>
      {children}
    </button>
  );
}

function PrimaryButton({ children, ...props }) {
  return (
    <Button variant="primary" {...props}>
      {children}
    </Button>
  );
}
```

#### 2. Custom Hooks for Reusable Logic

```javascript
// ✅ Good - Custom hook
function useAuth() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Auth logic
  }, []);

  return { user, isAuthenticated };
}

// Usage
function Profile() {
  const { user, isAuthenticated } = useAuth();
  // Component logic
}
```

#### 3. Lazy Loading for Routes

```javascript
// ✅ Good - Lazy loading
import React, { lazy, Suspense } from "react";

const ProductPage = lazy(() => import("./pages/ProductPage"));
const CartPage = lazy(() => import("./pages/CartPage"));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/products" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </Suspense>
  );
}
```

#### 4. Prop Validation

```javascript
// ✅ Good - Always validate props
import PropTypes from "prop-types";

function UserCard({ user, onEdit }) {
  return <div>{/* Component JSX */}</div>;
}

UserCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
  onEdit: PropTypes.func,
};
```

#### 5. Conditional Rendering

```javascript
// ✅ Good - Clear conditional rendering
function ProductList({ products, isLoading, error }) {
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!products.length) return <EmptyState />;

  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

---

## Backend Guidelines

### Architecture Pattern: MVC with Service Layer

```
Request → Route → Controller → Service → Model → Database
                      ↓
                  Response
```

#### Controllers

- Handle HTTP requests and responses
- Validate request data
- Call service layer for business logic
- Return appropriate HTTP status codes

```javascript
// ✅ Good - Controller example
const productController = {
  async getAll(req, res, next) {
    try {
      const products = await productService.getAllProducts();
      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default productController;
```

#### Services

- Contain business logic
- Interact with models/database
- Reusable across controllers
- No direct access to req/res objects

```javascript
// ✅ Good - Service example
const productService = {
  async getAllProducts() {
    const products = await Product.findAll();
    return products;
  },

  async getProductById(id) {
    const product = await Product.findById(id);
    return product;
  },

  async createProduct(productData) {
    // Business logic validation
    if (productData.price < 0) {
      throw new Error("Price cannot be negative");
    }

    const product = await Product.create(productData);
    return product;
  },
};

export default productService;
```

#### Models

- Define database schema
- Handle database operations
- No business logic

```javascript
// ✅ Good - Model example
import db from "../config/database.js";

const Product = {
  async findAll() {
    const [rows] = await db.query(
      "SELECT * FROM products WHERE deleted_at IS NULL",
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(
      "SELECT * FROM products WHERE id = ? AND deleted_at IS NULL",
      [id],
    );
    return rows[0];
  },

  async create(productData) {
    const { name, description, price, stock } = productData;
    const [result] = await db.query(
      "INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)",
      [name, description, price, stock],
    );
    return this.findById(result.insertId);
  },
};

export default Product;
```

### RESTful API Design

#### Standard Response Format

```javascript
// Success Response
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}

// Error Response
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "details": { /* optional error details */ }
  }
}

// Paginated Response
{
  "success": true,
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### HTTP Status Codes

- `200` - OK (successful GET, PUT, PATCH)
- `201` - Created (successful POST)
- `204` - No Content (successful DELETE)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error (server errors)

---

## Error Handling

### Backend Error Handling

#### Custom Error Classes

```javascript
// utils/errors.js
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

export { AppError, ValidationError, NotFoundError, UnauthorizedError };
```

#### Global Error Middleware

```javascript
// middleware/errorHandler.js
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

#### Usage in Controllers

```javascript
// ✅ Good - Proper error handling
async function getProduct(req, res, next) {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error); // Pass to error middleware
  }
}
```

### Frontend Error Handling

#### Error Boundary Component

```javascript
// components/common/ErrorBoundary.jsx
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h1>Something went wrong</h1>
          <p>
            We're sorry for the inconvenience. Please try refreshing the page.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

#### API Error Handling

```javascript
// services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
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

---

## Security Best Practices

### Authentication & Authorization

#### JWT Implementation

```javascript
// Backend - JWT in httpOnly cookies
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Login controller
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await authService.login(email, password);
    const token = generateToken(user.id);

    setTokenCookie(res, token);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}
```

#### Authentication Middleware

```javascript
// middleware/auth.js
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
    next(new UnauthorizedError("Invalid or expired token"));
  }
};

export default authenticate;
```

### Input Validation

#### Backend Validation

```javascript
// validators/product.validator.js
import Joi from "joi";

const productSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  price: Joi.number().positive().required(),
  stock: Joi.number().integer().min(0).required(),
  categoryId: Joi.number().integer().positive().required(),
});

const validateProduct = (req, res, next) => {
  const { error } = productSchema.validate(req.body);

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

export default validateProduct;
```

#### Frontend Validation

```javascript
// utils/validation.js
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export { validateEmail, validatePassword };
```

### Environment Variables

#### Required Environment Variables

```bash
# Backend (.env)
NODE_ENV=development
PORT=5000
DB_HOST=mysql
DB_PORT=3306
DB_NAME=ecommerce
DB_USER=root
DB_PASSWORD=password
JWT_SECRET=your-secret-key-here
CORS_ORIGIN=http://localhost:3000

# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000/api
```

#### Environment Variable Usage

```javascript
// ✅ Good - Always use environment variables for configuration
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

// ❌ Bad - Never hardcode sensitive data
const dbConfig = {
  host: "localhost",
  password: "mypassword123",
};
```

---

## Database Guidelines

### Schema Design Principles

- Use plural table names (e.g., `users`, `products`, `orders`, `cart_items`, `order_items`)
- Use `id` as primary key (auto-increment integer)
- Use `created_at` and `updated_at` timestamps
- Use `deleted_at` for soft deletes
- Use snake_case for column names
- Add appropriate indexes for foreign keys and frequently queried columns

### Migration Files

```javascript
// migrations/001_create_users_table.js
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
      deleted_at TIMESTAMP NULL
    )
  `);
};

export const down = async (db) => {
  await db.query("DROP TABLE IF EXISTS users");
};
```

### Query Best Practices

```javascript
// ✅ Good - Use parameterized queries to prevent SQL injection
const getUser = async (email) => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE email = ? AND deleted_at IS NULL",
    [email],
  );
  return rows[0];
};

// ❌ Bad - Never use string concatenation
const getUser = async (email) => {
  const [rows] = await db.query(`SELECT * FROM users WHERE email = '${email}'`);
  return rows[0];
};
```

---

## Git Workflow

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(auth): add JWT authentication
fix(cart): resolve cart total calculation bug
docs(readme): update installation instructions
```

### Branch Naming

- Feature: `feature/feature-name`
- Bug fix: `fix/bug-description`
- Hotfix: `hotfix/critical-issue`

---

## Docker Guidelines

### Dockerfile Best Practices

```dockerfile
# ✅ Good - Multi-stage build for frontend
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

- All services must start with `docker compose up`
- No manual steps required after cloning
- Include health checks for services
- Use environment variables from `.env` file

---

## Performance Guidelines

### Frontend Performance

- Lazy load routes and heavy components
- Optimize images (use WebP, lazy loading)
- Minimize bundle size (code splitting)
- Use React.memo for expensive components
- Debounce search inputs and API calls

### Backend Performance

- Use database indexes appropriately
- Implement pagination for large datasets
- Cache frequently accessed data
- Use connection pooling for database
- Optimize database queries (avoid N+1 queries)

---

## Accessibility Guidelines

- Use semantic HTML elements
- Include alt text for images
- Ensure keyboard navigation works
- Maintain sufficient color contrast
- Use ARIA labels where appropriate
- Test with screen readers

---

## Documentation Requirements

### Code Comments

```javascript
// ✅ Good - Comment complex logic
/**
 * Calculates the discounted price based on user tier and product category
 * @param {number} price - Original price
 * @param {string} userTier - User membership tier (bronze, silver, gold)
 * @param {string} category - Product category
 * @returns {number} Discounted price
 */
function calculateDiscount(price, userTier, category) {
  // Complex discount logic here
}

// ❌ Bad - Don't comment obvious code
// Set user name to John
const userName = "John";
```

### API Documentation

- Document all API endpoints
- Include request/response examples
- Specify required/optional parameters
- Document error responses

---

## Summary Checklist

Before submitting code, ensure:

- [ ] Code follows naming conventions
- [ ] ESLint and Prettier pass without errors
- [ ] All functions have proper error handling
- [ ] Input validation on both frontend and backend
- [ ] No hardcoded values (use environment variables)
- [ ] PropTypes defined for all React components
- [ ] Database queries use parameterized statements
- [ ] API responses follow standard format
- [ ] Appropriate HTTP status codes used
- [ ] Code is properly commented where necessary
- [ ] No console.logs in production code
- [ ] Git commit messages follow convention

---

## Conclusion

These guidelines are designed to ensure consistency, maintainability, and quality across the entire codebase. All AI-generated code must strictly adhere to these standards. When in doubt, refer back to this document or ask for clarification.

**Remember:** These guidelines are not suggestions—they are requirements for all code in this project.
