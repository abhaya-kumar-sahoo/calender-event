const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.GOOGLE_APP_PASSWORD,
    },
});

const sendConfirmationEmail = async (to, subject, html) => {
    console.log({
        user: process.env.SMTP_USER,
        pass: process.env.GOOGLE_APP_PASSWORD,
    });
    try {
        const mailOptions = {
            from: `"Heritage Lane and Co Furniture" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

/**
 * Sends an email using OAuth2 via Nodemailer.
 * Used for OTPs where we want to send from the host's account.
 */
const sendOAuthEmail = async (user, mailOptions) => {
    if (!user.refreshToken) {
        throw new Error('User has no refresh token for OAuth2');
    }

    const oauthTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: user.email,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: user.refreshToken,
        },
    });

    const finalOptions = {
        from: `"${user.name || 'Host'}" <${user.email}>`,
        ...mailOptions,
    };

    try {
        await oauthTransporter.sendMail(finalOptions);
        console.log(`OAuth2 Email sent to ${mailOptions.to} via Nodemailer`);
    } catch (error) {
        console.error('Error sending OAuth2 email:', error);
        throw error;
    }
};

module.exports = { sendConfirmationEmail, sendOAuthEmail };
