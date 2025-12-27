const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
            console.log('Passport Google Strategy Callback');
            try {
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    console.log('Creating new user for Google ID:', profile.id);
                    user = await User.create({
                        googleId: profile.id,
                        email: profile.emails[0].value,
                        name: profile.displayName,
                        picture: profile.photos ? profile.photos[0].value : null,
                        refreshToken: refreshToken,
                    });
                } else if (refreshToken) {
                    console.log('Updating refresh token for user:', user._id);
                    user.refreshToken = refreshToken;
                    await user.save();
                } else {
                    console.log('User found:', user._id);
                }

                return done(null, user);
            } catch (err) {
                console.error('Error in Google Strategy:', err);
                return done(err, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    console.log('Serializing user:', user.id);
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    // console.log('Deserializing user:', id);
    try {
        const user = await User.findById(id);
        if (!user) {
            console.log('Deserialization failed: User not found for ID:', id);
        }
        done(null, user);
    } catch (err) {
        console.error('Deserialization error:', err);
        done(err, null);
    }
});
