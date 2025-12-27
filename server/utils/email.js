const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.GOOGLE_APP_PASSWORD,
    },
});

const sendConfirmationEmail = async (to, subject, html) => {
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

module.exports = { sendConfirmationEmail };
