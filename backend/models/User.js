const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const joi = require('joi');

const userSchema = new mongoose.Schema({
    fullName: {
        required: [true, 'Full name req'],
        trim: true,
        type: String
    },
    email: {
        required: [true, 'email req'],
        type: String,
        unique: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't return password by default
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allow multiple null values
    },
    authMethod: {
        type: String,
        enum: ['email', 'google'],
        default: 'email'
    },
    profilePicture: {
        type: String, // URL to Google profile picture
        default: null
    }
},
    {
        timestamps: true
    });

// Hash password before saving (only if password is provided)
userSchema.pre('save', function (next) {
    // If user is signing up with Google, no password to hash
    if (!this.password) {
        return next();
    }

    // Don't hash if password wasn't modified
    if (!this.isModified('password')) {
        return next();
    }

    // Hash the password
    bcrypt.hash(this.password, 10)
        .then(hashedPassword => {
            this.password = hashedPassword;
            next();
        })
        .catch(error => {
            next(error);
        });
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);