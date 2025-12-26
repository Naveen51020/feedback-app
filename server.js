const express = require('express');
const path = require('path');
const twilio = require('twilio');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// --- Database Setup ---
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

// Create a schema for the feedback
const FeedbackSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    visit: String,
    date: { type: Date, default: Date.now }
});

const Feedback = mongoose.model('Feedback', FeedbackSchema);

// --- Twilio Credentials ---
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SID;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const client = new twilio(accountSid, authToken);

// --- Middleware ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// --- API Routes ---

// API to send OTP
app.post('/send-otp', (req, res) => {
    const { mobile } = req.body;
    client.verify.v2
        .services(verifySid)
        .verifications.create({ to: mobile, channel: "sms" })
        .then(() => res.json({ success: true }))
        .catch(error => {
            console.error(error);
            res.json({ success: false });
        });
});

// API to verify OTP
app.post('/verify-otp', (req, res) => {
    const { mobile, otp } = req.body;
    client.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: mobile, code: otp })
      .then((verification_check) => {
        if(verification_check.status === 'approved'){
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
      })
      .catch(error => {
            console.error(error);
            res.json({ success: false });
      });
});

// API to submit feedback and send thank you message
app.post('/submit-feedback', (req, res) => {
    const { name, mobile, visit } = req.body;

    // 1. Save the feedback to the database
    const newFeedback = new Feedback({ name, mobile, visit });
    newFeedback.save()
        .then(() => {
            // 2. If saving is successful, send the thank you SMS
            client.messages
              .create({
                 body: 'Thank you for your valuable feedback. We hope you had a pleasant visit at ISKCON Newtown. Hare Krishna!',
                 from: twilioPhoneNumber,
                 to: mobile
               })
              .then(() => res.json({ success: true }))
              .catch(error => {
                console.error("Error sending SMS:", error);
                res.json({ success: false, message: "Feedback saved, but failed to send SMS." });
              });
        })
        .catch(error => {
            console.error("Error saving to database:", error);
            res.json({ success: false, message: "Failed to save feedback." });
        });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
