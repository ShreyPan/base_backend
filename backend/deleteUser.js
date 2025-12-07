require('dotenv').config();
const mongoose = require('mongoose');

const deleteUser = async (email) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const User = require('./models/User');

        const result = await User.deleteOne({ email: email });

        if (result.deletedCount > 0) {
            console.log(`✅ User with email "${email}" deleted successfully`);
        } else {
            console.log(`❌ No user found with email "${email}"`);
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

// Get email from command line argument
const email = process.argv[2];

if (!email) {
    console.log('Usage: node deleteUser.js <email>');
    process.exit(1);
}

deleteUser(email);
