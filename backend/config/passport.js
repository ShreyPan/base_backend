const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Initialize Google Strategy
const initializeGoogleStrategy = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user already exists with this Google ID
                    let user = await User.findOne({ googleId: profile.id });

                    if (user) {
                        // User exists, return it
                        return done(null, user);
                    }

                    // Check if user exists with this email
                    user = await User.findOne({ email: profile.emails[0].value });

                    if (user) {
                        // Link Google account to existing email account
                        user.googleId = profile.id;
                        user.authMethod = 'google';
                        if (profile.photos[0]) {
                            user.profilePicture = profile.photos[0].value;
                        }
                        await user.save();
                        return done(null, user);
                    }

                    // Create new user
                    const newUser = await User.create({
                        fullName: profile.displayName,
                        email: profile.emails[0].value,
                        googleId: profile.id,
                        authMethod: 'google',
                        profilePicture: profile.photos[0]?.value || null
                    });

                    return done(null, newUser);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );
};

// Serialize user to store in session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = {
    passport,
    initializeGoogleStrategy
};