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
        required: [true, 'Pass req'],
        minlength: [6, 'Password must be at least 6 characters']
    }
},
    {
        timestamps: true
    });

// Hash password before saving
userSchema.pre('save', function (next) {
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