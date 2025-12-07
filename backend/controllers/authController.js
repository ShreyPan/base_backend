const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '30m' }
    );
};

const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
};

const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendError(res, 'User already exists with this email', 400);
        }

        // Create new user (validation is handled by middleware)
        const newUser = await User.create({
            fullName: name, // Map 'name' to 'fullName' for database
            email,
            password
        });

        const accessToken = generateToken(newUser._id);
        const refreshToken = generateRefreshToken(newUser._id);

        sendSuccess(res, {
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                createdAt: newUser.createdAt
            },
            accessToken,
            refreshToken
        }, 'User registered successfully', 201);

    } catch (error) {
        next(error); // Pass to global error handler
    }
};

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return sendError(res, 'Invalid email or password', 401);
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return sendError(res, 'Invalid email or password', 401);
        }

        const accessToken = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        sendSuccess(res, {
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
            },
            accessToken,
            refreshToken
        }, 'Login successful');

    } catch (error) {
        next(error); // Pass to global error handler
    }
};

const getUserInfo = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return sendError(res, 'User not found', 404);
        }

        sendSuccess(res, {
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        }, 'User info retrieved successfully');

    } catch (error) {
        next(error); // Pass to global error handler
    }
};

// Google OAuth Callback
const googleCallback = async (req, res, next) => {
    try {
        // User is attached by Passport middleware
        const user = req.user;

        const accessToken = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // In production, redirect to frontend with tokens
        // For now, return JSON response
        sendSuccess(res, {
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePicture: user.profilePicture,
                authMethod: user.authMethod,
                createdAt: user.createdAt
            },
            accessToken,
            refreshToken
        }, 'Google authentication successful', 200);

    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserInfo,
    googleCallback
};