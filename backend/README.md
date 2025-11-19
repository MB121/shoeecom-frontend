# Shoe E-commerce Backend

A comprehensive Node.js backend for a shoe e-commerce website built with Express.js, MongoDB, and Stripe integration.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (User/Admin)
  - Password hashing with bcrypt
  - User profile management

- **Product Management**
  - CRUD operations for products
  - Image upload support
  - Category and subcategory filtering
  - Search functionality
  - Stock management
  - Product reviews and ratings

- **Order Management**
  - Complete order lifecycle
  - Order status tracking
  - Order history
  - Admin order management

- **Shopping Cart**
  - Add/remove items
  - Quantity updates
  - Stock validation

- **Payment Integration**
  - Stripe payment processing
  - Payment intent creation
  - Webhook handling
  - Refund processing

- **Admin Panel**
  - Dashboard with analytics
  - User management
  - Product management
  - Order management
  - Sales analytics
  - Inventory reports

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Payment**: Stripe
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Stripe account for payments

### 1. Install Dependencies

\`\`\`bash
cd backend
npm install
\`\`\`

### 2. Environment Variables

Create a `.env` file in the backend directory:

\`\`\`env
# Database
MONGODB_URI=mongodb://localhost:27017/shoe-ecommerce

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
\`\`\`

### 3. Database Setup

#### Option A: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service:
   \`\`\`bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Ubuntu
   sudo systemctl start mongod
   
   # On Windows
   net start MongoDB
   \`\`\`

#### Option B: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `MONGODB_URI` in `.env`

### 4. Stripe Setup

1. Create account at [Stripe](https://stripe.com)
2. Get API keys from Dashboard > Developers > API keys
3. Update `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` in `.env`
4. Set up webhook endpoint for `/api/payments/webhook`

### 5. Start the Server

\`\`\`bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
\`\`\`

The server will start on `http://localhost:5000`

### 6. Seed Sample Data

\`\`\`bash
npm run seed
\`\`\`

This will populate your database with sample products, categories, and an admin user.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/addresses` - Add address
- `PUT /api/auth/addresses/:id` - Update address
- `DELETE /api/auth/addresses/:id` - Delete address

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `POST /api/products/:id/reviews` - Add product review
- `GET /api/products/categories/list` - Get categories

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/cancel` - Cancel order
- `GET /api/orders/admin/all` - Get all orders (Admin)
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove cart item
- `DELETE /api/cart` - Clear cart

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `POST /api/payments/webhook` - Stripe webhook
- `POST /api/payments/refund` - Process refund
- `GET /api/payments/methods` - Get payment methods

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/users/:id` - Get user details
- `GET /api/admin/analytics/sales` - Sales analytics
- `GET /api/admin/inventory/report` - Inventory report
- `PUT /api/admin/products/bulk-status` - Bulk update products
- `GET /api/admin/export/:type` - Export data

### Users
- `POST /api/users/wishlist/:productId` - Add to wishlist
- `DELETE /api/users/wishlist/:productId` - Remove from wishlist
- `GET /api/users/wishlist` - Get wishlist

## Database Schema

### User
- Personal information (name, email, phone)
- Authentication (password, role)
- Addresses array
- Wishlist
- Account status

### Product
- Basic info (name, description, price)
- Categories and subcategories
- Sizes and colors with stock
- Images array
- Reviews and ratings
- SEO fields

### Order
- User reference
- Items array with product details
- Shipping and billing addresses
- Payment information
- Pricing breakdown
- Status tracking
- Order history

### Cart
- User reference
- Items array
- Calculated totals

## Security Features

- **Authentication**: JWT tokens with expiration
- **Authorization**: Role-based access control
- **Password Security**: Bcrypt hashing
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Express Validator
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers
- **File Upload**: Size and type restrictions

## Error Handling

- Centralized error handling middleware
- Validation error responses
- Database error handling
- Payment error handling
- Proper HTTP status codes

## Testing

\`\`\`bash
# Run tests (if implemented)
npm test

# Check API health
curl http://localhost:5000/api/health
\`\`\`

## Deployment

### Environment Variables for Production

\`\`\`env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
STRIPE_SECRET_KEY=your-production-stripe-key
FRONTEND_URL=https://your-frontend-domain.com
\`\`\`

### Deployment Platforms

- **Heroku**: Easy deployment with MongoDB Atlas
- **Vercel**: Serverless functions
- **DigitalOcean**: VPS deployment
- **AWS**: EC2 or Lambda

## Monitoring & Logging

- Console logging for development
- Error logging for production
- Health check endpoint
- Performance monitoring (can add tools like New Relic)

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## License

MIT License - see LICENSE file for details
