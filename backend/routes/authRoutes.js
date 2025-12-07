const express = require('express');
const router = express.Router();
const passport = require('passport');
const { registerUser, loginUser, getUserInfo, googleCallback, verifyEmail, resendVerificationCode } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateRegistration, validateLogin } = require('../middleware/validation');

// Public routes
router.post('/register', validateRegistration, registerUser);
router.post('/login', validateLogin, loginUser);

// Email verification routes
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationCode);

// Google OAuth routes
// Redirect to Google login page
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// Google callback after user grants permission
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/login' }),
    googleCallback
);

// Protected routes
router.get('/profile', authMiddleware, getUserInfo);

module.exports = router;