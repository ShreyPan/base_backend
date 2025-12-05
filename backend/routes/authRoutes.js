const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserInfo } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateRegistration, validateLogin } = require('../middleware/validation');

// Public routes
router.post('/register', validateRegistration, registerUser);
router.post('/login', validateLogin, loginUser);

// Protected routes
router.get('/profile', authMiddleware, getUserInfo);

module.exports = router;