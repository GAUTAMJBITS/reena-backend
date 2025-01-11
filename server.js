const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: 'https://reena-photography-and-videog.onrender.com' })); // Replace with your deployed frontend URL
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Route to serve the homepage (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'), (err) => {
        if (err) {
            console.error('Error serving index.html:', err);
            res.status(500).send('Server Error');
        }
    });
});

// Route to handle contact form submission
app.post('/backend', async (req, res) => {
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

        // Redirect to the thank-you page in the frontend directory
        res.redirect('/thank-you'); // Redirect to the /thank-you route

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Error sending email.', error: error.message });
    }
});

// Route to serve the thank-you page
app.get('/thank-you', (req, res) => {
    const thankYouPath = path.join(__dirname, '../frontend/thank-you.html');
    res.sendFile(thankYouPath, (err) => {
        if (err) {
            console.error('Error serving thank-you.html:', err);
            res.status(500).send('Server Error');
        }
    });
});

// Route to serve the index.html from the frontend folder
app.get('/index', (req, res) => {
    const indexPath = path.join(__dirname, '../frontend/index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error serving index.html:', err);
            res.status(500).send('Server Error');
        }
    });
});

// Start the server
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
