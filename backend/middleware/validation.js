const Joi = require('joi');

const validateRegistration = (req, res, next) => {
    const schema = Joi.object({
        fullName: Joi.string().min(2).max(50).trim().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            details: error.details[0].message
        });
    }
    next();
};

const validateLogin = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            details: error.details[0].message
        });
    }
    next();
};

// Generic validation function
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                details: error.details[0].message
            });
        }
        next();
    };
};

module.exports = {
    validateRegistration,
    validateLogin,
    validate
};