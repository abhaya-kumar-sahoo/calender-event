const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.events'],
        accessType: 'offline',
        prompt: 'consent',
    })
);

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: process.env.CLIENT_URL }),
    (req, res) => {
        // Successful authentication
        res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    }
);

router.get('/user', (req, res) => {
    res.json(req.user || null);
});

router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect(process.env.CLIENT_URL);
    });
});

module.exports = router;
