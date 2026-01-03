const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { otpStore } = require('../utils/otpStore');
const router = express.Router();

// Email/Password Registration
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, otp } = req.body;

        // Basic validation
        if (!name || !email || !password || !otp) {
            return res.status(400).json({ message: 'Please enter all fields including OTP' });
        }

        // Verify OTP
        const storedData = otpStore.get(email);
        if (!storedData) {
            return res.status(400).json({ message: 'OTP not found or expired' });
        }
        if (Date.now() > storedData.expires) {
            otpStore.delete(email);
            return res.status(400).json({ message: 'OTP expired' });
        }
        if (storedData.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });

        const savedUser = await newUser.save();

        // Clear OTP after successful registration
        otpStore.delete(email);

        // Log user in immediately
        req.login(savedUser, (err) => {
            if (err) throw err;
            res.json({
                user: {
                    id: savedUser._id,
                    name: savedUser.name,
                    email: savedUser.email,
                }
            });
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Email/Password Login
router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        // Check for existing user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        // Check if user has a password (might be OAuth only)
        if (!user.password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Log in
        req.login(user, (err) => {
            if (err) throw err;
            res.json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                }
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});


router.get(
    '/google',
    (req, res, next) => {
        console.log('Initiating Google Auth...');
        next();
    },
    passport.authenticate('google', {
        scope: [
            'profile',
            'email',
            'https://www.googleapis.com/auth/calendar.events'
        ],
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
    // console.log('GET /auth/user hit. IsAuthenticated:', req.isAuthenticated());
    // if (req.user) {
    //     console.log('User found in session:', req.user._id);
    // } 
    res.json(req.user || null);
});

router.get('/logout', (req, res) => {
    console.log('Logging out user:', req.user ? req.user._id : 'unknown');
    req.logout(() => {
        console.log('Logout successful. Redirecting to:', process.env.CLIENT_URL);
        res.redirect(process.env.CLIENT_URL);
    });
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        console.log('Stored Data:', { email, otp, newPassword });

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const storedData = otpStore.get(email);
        console.log('Stored Data:', storedData);

        if (!storedData) {
            return res.status(400).json({ message: 'OTP not found or expired' });
        }

        if (Date.now() > storedData.expires) {
            otpStore.delete(email);
            return res.status(400).json({ message: 'OTP expired' });
        }

        if (storedData.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // OTP is valid
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const user = await User.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        otpStore.delete(email);
        res.json({ message: 'Password reset successful. Please login.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
