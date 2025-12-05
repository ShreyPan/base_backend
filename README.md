# ExpenseTracker Backend API

A professional Node.js/Express backend with JWT authentication, built with industry best practices.

## 🚀 Features

- **JWT Authentication** - Access & refresh tokens with secure password hashing
- **Input Validation** - Joi-based request validation
- **Error Handling** - Global error middleware with custom error types
- **Security** - Rate limiting, CORS, Helmet protection
- **API Versioning** - Clean `/api/v1/` structure
- **Health Monitoring** - Health check endpoint
- **Request Logging** - Morgan middleware for request/response tracking
- **Database** - MongoDB with Mongoose ODM
- **Professional Architecture** - MVC pattern with middleware separation

## 🛠️ Tech Stack

- **Runtime:** Node.js v22+
- **Framework:** Express.js v5
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT with bcryptjs
- **Validation:** Joi
- **Security:** Helmet, CORS, express-rate-limit
- **Logging:** Morgan
- **Environment:** dotenv

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- npm or yarn

## ⚙️ Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd errPrac
```

2. Install dependencies
```bash
cd backend
npm install
```

3. Create environment file
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

5. Start the server
```bash
npm start
# or for development
npm run dev
```

## 🌐 API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login  
- `GET /api/v1/auth/profile` - Get user profile (Protected)

## 📝 API Documentation

### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com", 
    "password": "password123"
}
```

### Login User
```http
POST /api/v1/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "password123" 
}
```

### Get User Profile
```http
GET /api/v1/auth/profile
Authorization: Bearer <access_token>
```

## 🏗️ Project Structure

```
backend/
├── config/
│   └── db.js              # Database connection
├── controllers/
│   └── authController.js  # Authentication logic
├── middleware/
│   ├── authMiddleware.js  # JWT verification
│   ├── errorHandler.js   # Global error handling
│   └── validation.js     # Input validation
├── models/
│   └── User.js           # User schema
├── routes/
│   └── authRoutes.js     # Authentication routes
├── utils/
│   └── response.js       # Response utilities
├── .env.example          # Environment template
├── package.json
└── server.js             # Main application file
```

## 🔐 Security Features

- **Password Hashing** - bcryptjs with salt rounds
- **JWT Tokens** - Access (30min) & refresh (7d) tokens
- **Rate Limiting** - Protection against brute force attacks
- **Input Validation** - Joi schema validation for all inputs
- **CORS Protection** - Configured for specific origins
- **Helmet Security** - Security headers protection

## 🚀 Deployment

### Environment Variables for Production
```
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_strong_jwt_secret
JWT_REFRESH_SECRET=your_strong_refresh_secret
CLIENT_URL=your_frontend_domain
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Next Steps

This backend foundation can be extended for various applications:
- E-commerce platform
- Healthcare appointment system
- Property management platform
- Social media application
- Project management tool

## 📞 Contact

Your Name - your.email@example.com
Project Link: [https://github.com/yourusername/errPrac](https://github.com/yourusername/errPrac)