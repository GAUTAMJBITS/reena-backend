const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: 'https://reena-photography-and-videog.onrender.com' })); // Replace with your deployed frontend URL
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route to handle contact form submission
app.post('/', async (req, res) => {
    const { name, email, subject, message } = req.body;

    try {
        // Setup Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Mail options to send to admin
        const mailOptions = {
            from: email,
            to: process.env.EMAIL_TO,
            subject: `Contact Form Submission: ${subject}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
        };

        // Send email to admin
        await transporter.sendMail(mailOptions);

        // Send confirmation email to user
        const confirmationMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Thank you for contacting us!',
            text: `Hi ${name},\n\nThank you for reaching out to us. We have received your message and will get back to you shortly.\n\nMessage:\n${message}\n\nBest regards,\nREENA Photography and Videolab`,
        };

        await transporter.sendMail(confirmationMailOptions);

        // Send a JSON response to confirm success
        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Error sending email.', error: error.message });
    }
});

// Route to serve a test endpoint (optional for debugging)
app.get('/test', (req, res) => {
    res.status(200).json({ message: 'Backend is live and working!' });
});

// Start the server
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
