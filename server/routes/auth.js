const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get(
    '/google',
    (req, res, next) => {
        console.log('Initiating Google Auth...');
        next();
    },
    passport.authenticate('google', {
        scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.events'],
        accessType: 'offline',
        prompt: 'consent',
    })
);

router.get(
    '/google/callback',
    (req, res, next) => {
        console.log('Google Auth Callback hit. Query:', req.query);
        next();
    },
    passport.authenticate('google', { failureRedirect: process.env.CLIENT_URL }),
    (req, res) => {
        // Successful authentication
        console.log('Google Auth Successful. User:', req.user._id);
        console.log('Session ID:', req.sessionID);
        res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    }
);

router.get('/user', (req, res) => {
    console.log('GET /auth/user hit. IsAuthenticated:', req.isAuthenticated());
    if (req.user) {
        console.log('User found in session:', req.user._id);
    } else {
        console.log('No user in session.');
    }
    res.json(req.user || null);
});

router.get('/logout', (req, res) => {
    console.log('Logging out user:', req.user ? req.user._id : 'unknown');
    req.logout(() => {
        console.log('Logout successful. Redirecting to:', process.env.CLIENT_URL);
        res.redirect(process.env.CLIENT_URL);
    });
});

module.exports = router;
