const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        let token
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Token invalid'
            });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error(`Middleware error: ${error.message}`);

        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token invalid or expired'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = authMiddleware;