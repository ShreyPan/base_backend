const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');
const { generateVerificationCode, sendVerificationEmail } = require('../utils/emailService');

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
            // If user exists but email is not verified, delete and allow re-registration
            if (!existingUser.emailVerified) {
                await User.findByIdAndDelete(existingUser._id);
            } else {
                return sendError(res, 'User already exists with this email', 400);
            }
        }

        // Generate verification code
        const verificationCode = generateVerificationCode();
        const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create new user (validation is handled by middleware)
        const newUser = await User.create({
            fullName: name,
            email,
            password,
            emailVerified: false,
            verificationCode,
            verificationCodeExpiry
        });

        // Send verification email
        const emailResult = await sendVerificationEmail(email, verificationCode, name);

        if (!emailResult.success) {
            console.error('Failed to send verification email:', emailResult.error);
            // Don't fail registration if email fails, just log it
        }

        const accessToken = generateToken(newUser._id);
        const refreshToken = generateRefreshToken(newUser._id);

        sendSuccess(res, {
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                emailVerified: newUser.emailVerified,
                createdAt: newUser.createdAt
            },
            accessToken,
            refreshToken,
            message: 'Please check your email for verification code'
        }, 'User registered successfully. Verification email sent.', 201);

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

// Verify Email with Code
const verifyEmail = async (req, res, next) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return sendError(res, 'Email and verification code are required', 400);
        }

        // Find user with verification code
        const user = await User.findOne({
            email,
            verificationCode: code
        }).select('+verificationCode +verificationCodeExpiry');

        if (!user) {
            return sendError(res, 'Invalid verification code', 400);
        }

        // Check if code has expired
        if (user.verificationCodeExpiry < new Date()) {
            return sendError(res, 'Verification code has expired. Please request a new one.', 400);
        }

        // Mark email as verified
        user.emailVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpiry = undefined;
        await user.save();

        sendSuccess(res, {
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                emailVerified: user.emailVerified
            }
        }, 'Email verified successfully');

    } catch (error) {
        next(error);
    }
};

// Resend Verification Code
const resendVerificationCode = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return sendError(res, 'Email is required', 400);
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return sendError(res, 'User not found', 404);
        }

        if (user.emailVerified) {
            return sendError(res, 'Email is already verified', 400);
        }

        // Generate new verification code
        const verificationCode = generateVerificationCode();
        const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.verificationCode = verificationCode;
        user.verificationCodeExpiry = verificationCodeExpiry;
        await user.save();

        // Send verification email
        const emailResult = await sendVerificationEmail(email, verificationCode, user.fullName);

        if (!emailResult.success) {
            return sendError(res, 'Failed to send verification email', 500);
        }

        sendSuccess(res, {}, 'Verification code sent successfully. Please check your email.');

    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserInfo,
    googleCallback,
    verifyEmail,
    resendVerificationCode
};