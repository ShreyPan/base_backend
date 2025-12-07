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
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String,
        select: false // Don't return in queries
    },
    verificationCodeExpiry: {
        type: Date,
        select: false // Don't return in queries
    }
},
    {
        timestamps: true
    });

// Hash password before saving (only if password is provided)
// Hash password before saving (only if password is provided)
userSchema.pre('save', async function () {
    // If user is signing up with Google, no password to hash
    if (!this.password) {
        return;
    }

    // Don't hash if password wasn't modified
    if (!this.isModified('password')) {
        return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);