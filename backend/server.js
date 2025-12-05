const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();

// Trust proxy for accurate client IP
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

// Request logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 50,
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

// API routes (versioned)
app.use('/api/v1/auth', authRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'ExpTracker API v1.0',
        version: '1.0.0',
        status: 'running'
    });
});

// 404 handler for undefined routes
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to database and start server
connectDB();

app.listen(PORT, () => {
    console.log(`
🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}
📊 Health check: http://localhost:${PORT}/health
🔗 API: http://localhost:${PORT}/api/v1
    `);
});
