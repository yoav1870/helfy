# Capability Definitions

## Overview

This document defines the functional building blocks, domains, and capabilities that the AI can leverage while generating the eCommerce platform. These capabilities represent the core features and modules that must be implemented to create a fully functional, production-ready application.

---

## 1. Authentication & User Management

### Overview

Complete authentication system with secure user management, session handling, and access control.

### Core Capabilities

#### 1.1 User Registration

- **Endpoint**: `POST /api/auth/signup`
- **Features**:
  - Email and password-based registration
  - Email validation (format check)
  - Password strength validation (min 8 chars, uppercase, lowercase, number)
  - Password hashing using bcrypt (salt rounds: 10)
  - Duplicate email detection
  - Automatic user profile creation
- **Database Tables**: `users`
- **Response**: User object (without password) + JWT token in httpOnly cookie

#### 1.2 User Login

- **Endpoint**: `POST /api/auth/login`
- **Features**:
  - Email and password authentication
  - Password verification using bcrypt
  - JWT token generation (7-day expiration)
  - Token stored in httpOnly cookie
  - Failed login attempt tracking
- **Response**: User object + success message

#### 1.3 User Logout

- **Endpoint**: `POST /api/auth/logout`
- **Features**:
  - Clear JWT cookie
  - Session termination
- **Response**: Success message

#### 1.4 Authentication Middleware

- **Purpose**: Protect routes requiring authentication
- **Features**:
  - JWT token verification from cookies
  - Token expiration check
  - User ID extraction and attachment to request
  - Unauthorized error handling
- **Usage**: Apply to protected routes (cart, checkout, orders, profile)

#### 1.5 Password Security

- **Hashing**: bcrypt with salt rounds of 10
- **Storage**: Never store plain text passwords
- **Validation**: Enforce strong password requirements

### Database Schema

```sql
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
);
```

### Frontend Components

- `LoginPage.jsx` - Login form with validation
- `SignupPage.jsx` - Registration form with validation
- `ProtectedRoute.jsx` - Route wrapper for authenticated pages
- `useAuth.js` - Custom hook for authentication state

### Security Considerations

- JWT stored in httpOnly cookies (not localStorage)
- CSRF protection via sameSite cookie attribute
- Password never sent in responses
- Rate limiting on auth endpoints
- Input sanitization and validation

---

## 2. Product Catalog

### Overview

Enhanced product browsing experience with categories, search, filtering, and sorting capabilities.

### Core Capabilities

#### 2.1 Product Listing

- **Endpoint**: `GET /api/products`
- **Features**:
  - Paginated product list (20 items per page)
  - Support for query parameters (category, search, filters, sort)
  - Product images, name, price, description preview
  - Stock availability indicator
  - Category association
- **Response**: Array of products + pagination metadata

#### 2.2 Product Details

- **Endpoint**: `GET /api/products/:id`
- **Features**:
  - Full product information
  - Multiple product images
  - Complete description
  - Price and stock information
  - Category details
  - Related products suggestions
- **Response**: Single product object with full details

#### 2.3 Product Categories

- **Endpoint**: `GET /api/categories`
- **Features**:
  - List all product categories
  - Category name and description
  - Product count per category
  - Category hierarchy (if applicable)
- **Response**: Array of category objects

#### 2.4 Product Search

- **Endpoint**: `GET /api/products?search=query`
- **Features**:
  - Search by product name
  - Search by description keywords
  - Case-insensitive search
  - Partial match support
  - Search result highlighting
- **Implementation**: SQL LIKE queries or full-text search

#### 2.5 Product Filtering

- **Endpoint**: `GET /api/products?filter[category]=id&filter[minPrice]=0&filter[maxPrice]=1000`
- **Features**:
  - Filter by category
  - Filter by price range (min/max)
  - Filter by stock availability
  - Multiple filters can be combined
- **Implementation**: Dynamic SQL WHERE clauses

#### 2.6 Product Sorting

- **Endpoint**: `GET /api/products?sort=price_asc`
- **Features**:
  - Sort by price (ascending/descending)
  - Sort by name (A-Z, Z-A)
  - Sort by newest first
  - Sort by popularity (if tracking views/sales)
- **Options**: `price_asc`, `price_desc`, `name_asc`, `name_desc`, `newest`

### Database Schema

```sql
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  slug VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX idx_slug (slug)
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  image_url VARCHAR(500),
  images JSON,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  INDEX idx_category (category_id),
  INDEX idx_price (price),
  INDEX idx_slug (slug)
);
```

### Frontend Components

- `ProductList.jsx` - Grid/list view of products
- `ProductCard.jsx` - Individual product card
- `ProductDetails.jsx` - Full product page
- `SearchBar.jsx` - Search input with autocomplete
- `FilterSidebar.jsx` - Category and price filters
- `SortDropdown.jsx` - Sorting options
- `CategoryNav.jsx` - Category navigation
- `Pagination.jsx` - Page navigation component

### UI/UX Features

- Skeleton loaders during product fetch
- Smooth transitions between filter/sort changes
- Responsive grid layout (1-4 columns based on screen size)
- Product image hover effects
- Quick view modal option
- Breadcrumb navigation

---

## 3. Shopping Cart

### Overview

Persistent shopping cart that saves to database for logged-in users and survives page refreshes.

### Core Capabilities

#### 3.1 Add to Cart

- **Endpoint**: `POST /api/cart/items`
- **Features**:
  - Add product with specified quantity
  - Check stock availability before adding
  - Update quantity if product already in cart
  - Persist to database for logged-in users
  - Store in localStorage for guest users (optional)
- **Request Body**: `{ productId, quantity }`
- **Response**: Updated cart object

#### 3.2 View Cart

- **Endpoint**: `GET /api/cart`
- **Features**:
  - Retrieve all cart items for user
  - Include product details (name, price, image)
  - Calculate subtotal per item
  - Calculate cart total
  - Show stock availability status
- **Response**: Cart object with items array and totals

#### 3.3 Update Cart Item

- **Endpoint**: `PUT /api/cart/items/:id`
- **Features**:
  - Update item quantity
  - Validate against stock availability
  - Recalculate totals
  - Remove item if quantity is 0
- **Request Body**: `{ quantity }`
- **Response**: Updated cart object

#### 3.4 Remove from Cart

- **Endpoint**: `DELETE /api/cart/items/:id`
- **Features**:
  - Remove specific item from cart
  - Recalculate cart totals
  - Soft delete (mark as removed)
- **Response**: Updated cart object

#### 3.5 Clear Cart

- **Endpoint**: `DELETE /api/cart`
- **Features**:
  - Remove all items from cart
  - Used after successful order placement
- **Response**: Empty cart confirmation

#### 3.6 Cart Persistence

- **Features**:
  - Save cart to database for logged-in users
  - Cart survives browser refresh
  - Cart accessible across devices
  - Merge guest cart with user cart on login
  - Auto-update cart if product price changes

### Database Schema

```sql
CREATE TABLE carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user (user_id)
);

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
);
```

### Frontend Components

- `CartPage.jsx` - Full cart view page
- `CartItem.jsx` - Individual cart item row
- `CartSummary.jsx` - Cart totals sidebar
- `CartIcon.jsx` - Header cart icon with item count
- `MiniCart.jsx` - Dropdown cart preview
- `useCart.js` - Custom hook for cart operations

### UI/UX Features

- Real-time cart updates
- Toast notifications on add/remove
- Quantity increment/decrement buttons
- Stock availability warnings
- Empty cart state with CTA
- Cart icon badge with item count
- Smooth animations for add/remove
- Loading states during operations

---

## 4. Checkout Process

### Overview

Multi-step checkout flow guiding users from cart review through shipping, payment, and order confirmation.

### Core Capabilities

#### 4.1 Checkout Initialization

- **Endpoint**: `POST /api/checkout/init`
- **Features**:
  - Validate cart has items
  - Check stock availability for all items
  - Lock prices at checkout time
  - Create checkout session
  - Calculate initial totals
- **Response**: Checkout session object

#### 4.2 Step 1: Cart Review

- **Features**:
  - Display all cart items
  - Show item details (name, price, quantity, subtotal)
  - Allow quantity adjustments
  - Show cart summary (subtotal, tax estimate, total)
  - Proceed to shipping button
- **Validation**: Cart must have items

#### 4.3 Step 2: Shipping Information

- **Endpoint**: `POST /api/checkout/shipping`
- **Features**:
  - Collect shipping address
  - Fields: first name, last name, address line 1, address line 2, city, state, postal code, country, phone
  - Option to use saved addresses
  - Option to save new address
  - Address validation
  - Calculate shipping cost (can be flat rate or based on location)
- **Request Body**: Shipping address object
- **Response**: Updated checkout with shipping cost

#### 4.4 Step 3: Payment Information

- **Endpoint**: `POST /api/checkout/payment`
- **Features**:
  - **Mock Payment** (no real payment processing)
  - Collect payment method details (for display only)
  - Fields: card holder name, card number (masked), expiry, CVV (not stored)
  - Payment method selection (Credit Card, PayPal, etc.)
  - Billing address (same as shipping or different)
  - Order summary display
- **Request Body**: Payment method object
- **Response**: Payment confirmation (mock)

#### 4.5 Step 4: Order Confirmation

- **Endpoint**: `POST /api/orders`
- **Features**:
  - Create order record
  - Create order items from cart
  - Reduce product stock
  - Clear user's cart
  - Generate order number
  - Set order status to "pending"
  - Send order confirmation (mock email)
- **Response**: Order object with order number

#### 4.6 Order Summary Display

- **Features**:
  - Order number
  - Order date
  - Items ordered
  - Shipping address
  - Payment method (masked)
  - Order totals
  - Estimated delivery date
  - Link to order details page

### Database Schema

```sql
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
);

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
);

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
);
```

### Frontend Components

- `CheckoutPage.jsx` - Main checkout container
- `CheckoutStepper.jsx` - Progress indicator
- `CartReviewStep.jsx` - Step 1 component
- `ShippingStep.jsx` - Step 2 component
- `PaymentStep.jsx` - Step 3 component
- `OrderConfirmation.jsx` - Step 4 component
- `AddressForm.jsx` - Reusable address form
- `OrderSummary.jsx` - Sidebar with order totals
- `useCheckout.js` - Custom hook for checkout flow

### UI/UX Features

- Step progress indicator
- Form validation with error messages
- Ability to go back to previous steps
- Sticky order summary sidebar
- Loading states during submission
- Success animation on order completion
- Mobile-responsive multi-step layout
- Auto-save form data (localStorage)
- Smooth transitions between steps

---

## 5. User Account & Profile Management

### Overview

Complete account management system with profile editing, order history, saved addresses, and account settings.

### Core Capabilities

#### 5.1 View Profile

- **Endpoint**: `GET /api/users/profile`
- **Features**:
  - Retrieve user profile information
  - Display name, email, account creation date
  - Show account statistics (total orders, etc.)
- **Response**: User profile object

#### 5.2 Update Profile

- **Endpoint**: `PUT /api/users/profile`
- **Features**:
  - Update first name, last name
  - Update email (with validation)
  - Email uniqueness check
  - Profile update confirmation
- **Request Body**: `{ firstName, lastName, email }`
- **Response**: Updated user object

#### 5.3 Change Password

- **Endpoint**: `PUT /api/users/password`
- **Features**:
  - Require current password verification
  - Validate new password strength
  - Hash new password with bcrypt
  - Invalidate existing sessions (optional)
- **Request Body**: `{ currentPassword, newPassword }`
- **Response**: Success message

#### 5.4 Order History

- **Endpoint**: `GET /api/users/orders`
- **Features**:
  - List all user orders (paginated)
  - Show order number, date, status, total
  - Sort by date (newest first)
  - Filter by status
  - Link to order details
- **Response**: Array of order objects + pagination

#### 5.5 Order Details

- **Endpoint**: `GET /api/orders/:id`
- **Features**:
  - Full order information
  - Order items with product details
  - Shipping address
  - Payment method
  - Order status and tracking
  - Order timeline/history
- **Response**: Complete order object

#### 5.6 Saved Addresses

- **Endpoint**: `GET /api/users/addresses`
- **Features**:
  - List all saved addresses
  - Mark default address
  - Add new address
  - Edit existing address
  - Delete address
- **Response**: Array of address objects

#### 5.7 Add Address

- **Endpoint**: `POST /api/users/addresses`
- **Features**:
  - Save new shipping address
  - Set as default option
  - Address validation
- **Request Body**: Address object
- **Response**: Created address object

#### 5.8 Update Address

- **Endpoint**: `PUT /api/users/addresses/:id`
- **Features**:
  - Update existing address
  - Change default address
- **Request Body**: Address object
- **Response**: Updated address object

#### 5.9 Delete Address

- **Endpoint**: `DELETE /api/users/addresses/:id`
- **Features**:
  - Soft delete address
  - Prevent deletion if used in pending orders
- **Response**: Success message

#### 5.10 Account Settings

- **Features**:
  - Email notification preferences
  - Marketing email opt-in/out
  - Account deletion request (optional)
  - Privacy settings

### Frontend Components

- `AccountPage.jsx` - Main account dashboard
- `ProfileSection.jsx` - Profile info and edit
- `OrderHistory.jsx` - List of past orders
- `OrderDetails.jsx` - Single order view
- `AddressBook.jsx` - Saved addresses management
- `AddressCard.jsx` - Individual address display
- `AccountSettings.jsx` - Settings and preferences
- `PasswordChange.jsx` - Password update form
- `useProfile.js` - Custom hook for profile operations

### UI/UX Features

- Tabbed navigation for account sections
- Inline editing for profile fields
- Order status badges with colors
- Address cards with edit/delete actions
- Confirmation modals for destructive actions
- Success/error toast notifications
- Loading skeletons for data fetch
- Mobile-responsive layout
- Breadcrumb navigation

---

## 6. UI/UX & Design System

### Overview

Exceptional user experience with beautiful, modern design, smooth animations, and mobile-first responsive layout.

### Core Capabilities

#### 6.1 Design System

- **Color Palette**:
  - Primary color (brand)
  - Secondary color (accents)
  - Success, warning, error, info colors
  - Neutral grays (backgrounds, borders, text)
  - Dark mode support (optional)
- **Typography**:
  - Font family (modern, readable)
  - Heading hierarchy (H1-H6)
  - Body text sizes
  - Font weights (regular, medium, semibold, bold)
- **Spacing System**:
  - Consistent spacing scale (4px, 8px, 16px, 24px, 32px, etc.)
  - Margin and padding utilities
- **Border Radius**:
  - Consistent rounding (sm, md, lg, full)

#### 6.2 Component Library

- **Buttons**:
  - Primary, secondary, outline, ghost variants
  - Sizes: small, medium, large
  - Loading states with spinners
  - Disabled states
  - Icon buttons
- **Forms**:
  - Text inputs with labels
  - Select dropdowns
  - Checkboxes and radio buttons
  - Form validation states
  - Error messages
  - Helper text
- **Cards**:
  - Product cards
  - Info cards
  - Elevated cards with shadows
- **Modals**:
  - Centered modals
  - Slide-in panels
  - Confirmation dialogs
- **Navigation**:
  - Header with logo and nav links
  - Mobile hamburger menu
  - Footer with links
  - Breadcrumbs
- **Feedback**:
  - Toast notifications
  - Alert banners
  - Loading spinners
  - Progress bars
  - Skeleton loaders

#### 6.3 Animations & Micro-interactions

- **Framer Motion Integration**:
  - Page transitions (fade, slide)
  - Component enter/exit animations
  - Stagger animations for lists
  - Hover effects
  - Click feedback
- **Micro-interactions**:
  - Button hover states
  - Card hover lift effect
  - Input focus animations
  - Smooth scrolling
  - Ripple effects
  - Loading animations
  - Success checkmarks
  - Error shakes

#### 6.4 Loading States

- **Skeleton Loaders**:
  - Product card skeletons
  - List item skeletons
  - Profile page skeletons
  - Match actual content layout
- **Spinners**:
  - Full-page loading spinner
  - Button loading spinners
  - Inline loading indicators
- **Progress Indicators**:
  - Checkout step progress
  - Upload progress bars

#### 6.5 Toast Notifications

- **Features**:
  - Success, error, warning, info types
  - Auto-dismiss after 3-5 seconds
  - Manual dismiss option
  - Stack multiple toasts
  - Position: top-right (default)
  - Slide-in animation
- **Use Cases**:
  - Item added to cart
  - Order placed successfully
  - Profile updated
  - Error messages
  - Form submission feedback

#### 6.6 Responsive Design

- **Mobile-First Approach**:
  - Design for mobile screens first
  - Progressive enhancement for larger screens
- **Breakpoints**:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
- **Responsive Features**:
  - Hamburger menu on mobile
  - Collapsible filters on mobile
  - Touch-friendly buttons (min 44px)
  - Swipeable carousels
  - Responsive grid layouts
  - Adaptive typography

#### 6.7 Accessibility

- **WCAG 2.1 AA Compliance**:
  - Semantic HTML elements
  - ARIA labels where needed
  - Keyboard navigation support
  - Focus indicators
  - Color contrast ratios (4.5:1 minimum)
  - Alt text for images
  - Form labels and error associations
  - Skip to main content link

#### 6.8 Performance Optimizations

- **Image Optimization**:
  - Lazy loading images
  - Responsive images (srcset)
  - WebP format with fallbacks
  - Image compression
- **Code Splitting**:
  - Route-based code splitting
  - Lazy load heavy components
  - Dynamic imports
- **Caching**:
  - API response caching
  - Static asset caching
  - Service worker (optional)

### Frontend Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   ├── Toast.jsx
│   │   ├── Spinner.jsx
│   │   ├── SkeletonLoader.jsx
│   │   └── ...
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Sidebar.jsx
│   │   └── Layout.jsx
│   └── features/
│       ├── ProductCard.jsx
│       ├── CartItem.jsx
│       └── ...
├── styles/
│   ├── globals.css
│   └── tailwind.config.js
└── utils/
    ├── animations.js
    └── constants.js
```

### Design Inspiration

- Modern eCommerce sites (Shopify stores, Amazon, etc.)
- Clean, minimalist aesthetic
- Generous white space
- High-quality product imagery
- Clear call-to-action buttons
- Intuitive navigation
- Professional and trustworthy appearance

---

## 7. Data Seeding & Initial Setup

### Overview

Provide sample data for development and demonstration purposes.

### Core Capabilities

#### 7.1 Database Seeding

- **Categories**: 5-10 sample categories (Electronics, Clothing, Home & Garden, etc.)
- **Products**: 20-50 sample products with:
  - Realistic names and descriptions
  - Varied prices ($10 - $500)
  - Stock quantities
  - Product images (placeholder or real)
  - Category associations
- **Users**: 2-3 test users with hashed passwords
- **Sample Orders**: A few completed orders for demo

#### 7.2 Seed Script

- **Location**: `backend/src/seeds/`
- **Execution**: Run automatically on first `docker compose up`
- **Idempotency**: Check if data exists before seeding
- **Features**:
  - Clear existing data option
  - Seed in correct order (categories → products → users → orders)
  - Log seeding progress

---

## 8. API Documentation

### Overview

All API endpoints follow RESTful conventions and return consistent response formats.

### Standard Response Format

#### Success Response

```json
{
  "success": true,
  "data": {
    /* response data */
  },
  "message": "Optional success message"
}
```

#### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "details": {
      /* optional error details */
    }
  }
}
```

#### Paginated Response

```json
{
  "success": true,
  "data": [
    /* items */
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### API Endpoints Summary

#### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

#### Products

- `GET /api/products` - List products (with filters, search, sort)
- `GET /api/products/:id` - Get product details
- `GET /api/categories` - List categories

#### Cart

- `GET /api/cart` - Get user's cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove cart item
- `DELETE /api/cart` - Clear cart

#### Checkout & Orders

- `POST /api/checkout/init` - Initialize checkout
- `POST /api/checkout/shipping` - Submit shipping info
- `POST /api/checkout/payment` - Submit payment info
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details

#### User Profile

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/password` - Change password
- `GET /api/users/orders` - Get order history
- `GET /api/users/addresses` - Get saved addresses
- `POST /api/users/addresses` - Add address
- `PUT /api/users/addresses/:id` - Update address
- `DELETE /api/users/addresses/:id` - Delete address

---

## 9. Docker & Deployment

### Overview

Complete Docker setup for one-command deployment.

### Core Capabilities

#### 9.1 Docker Compose Configuration

- **Services**:
  - `frontend` - React app (Nginx in production)
  - `backend` - Node.js/Express API
  - `mysql` - MySQL database
- **Features**:
  - Service dependencies (backend waits for mysql)
  - Health checks for all services
  - Volume mounts for persistence
  - Environment variable injection
  - Network configuration

#### 9.2 Frontend Dockerfile

- **Multi-stage build**:
  - Stage 1: Build React app
  - Stage 2: Serve with Nginx
- **Features**:
  - Optimized production build
  - Minimal image size
  - Nginx configuration for SPA routing

#### 9.3 Backend Dockerfile

- **Features**:
  - Node.js Alpine image
  - Install dependencies
  - Copy source code
  - Run migrations on startup
  - Seed database on first run
  - Start Express server

#### 9.4 Database Initialization

- **Features**:
  - Create database if not exists
  - Run migrations automatically
  - Seed initial data
  - MySQL configuration for performance

#### 9.5 Environment Variables

- **`.env.example` file** with all required variables
- **Variables**:
  - Database credentials
  - JWT secret
  - API URLs
  - Port configurations
  - Node environment

#### 9.6 One-Command Deployment

- **Command**: `docker compose up`
- **Result**:
  - All services start
  - Database initialized
  - Migrations run
  - Data seeded
  - Frontend accessible at `http://localhost:3000`
  - Backend accessible at `http://localhost:5000`
  - No manual steps required

---

## 10. Error Handling & Validation

### Overview

Comprehensive error handling across the entire application.

### Core Capabilities

#### 10.1 Backend Error Handling

- **Custom Error Classes**:
  - `AppError` - Base error class
  - `ValidationError` - 400 errors
  - `NotFoundError` - 404 errors
  - `UnauthorizedError` - 401 errors
- **Global Error Middleware**:
  - Catch all errors
  - Log errors for debugging
  - Return consistent error responses
  - Hide sensitive info in production

#### 10.2 Frontend Error Handling

- **Error Boundaries**:
  - Catch React component errors
  - Display fallback UI
  - Log errors to console
- **API Error Handling**:
  - Axios interceptors
  - Handle 401 (redirect to login)
  - Display error messages
  - Retry logic for network errors

#### 10.3 Input Validation

- **Backend Validation**:
  - Joi schemas for request validation
  - Validate all user inputs
  - Sanitize inputs
  - Return detailed validation errors
- **Frontend Validation**:
  - Form validation before submission
  - Real-time validation feedback
  - Custom validation rules
  - Error message display

---

## Summary

This capability-definitions document outlines all the functional building blocks required to build a complete, production-ready eCommerce platform. Each capability is designed to work together seamlessly, following the engineering guidelines established in `engineering-guidelines.md`.

The AI should use these capability definitions as a blueprint when generating code, ensuring that all features are implemented consistently and completely. Each capability includes:

- Clear functional requirements
- API endpoint specifications
- Database schema definitions
- Frontend component structure
- UI/UX considerations
- Security and validation requirements

By following these capability definitions, the AI will generate a fully functional eCommerce platform that meets all the requirements specified in the assignment.
