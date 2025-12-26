const express = require('express');
const path = require('path');
const twilio = require('twilio');

const app = express();
const port = 3000;

// Twilio credentials - replace with your own
const accountSid = 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // Your Account SID from www.twilio.com/console
const authToken = 'your_auth_token'; // Your Auth Token from www.twilio.com/console
const client = new twilio(accountSid, authToken);
const verifySid = "VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";


// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API to send OTP
app.post('/send-otp', (req, res) => {
    const { mobile } = req.body;
    client.verify.v2
        .services(verifySid)
        .verifications.create({ to: mobile, channel: "sms" })
        .then((verification) => {
            console.log(verification.status)
            res.json({ success: true });
        })
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
        console.log(verification_check.status)
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

// API to send thank you message
app.post('/send-feedback', (req, res) => {
    const { mobile } = req.body;
    client.messages
      .create({
         body: 'Thank you for your valuable feedback. We hope you had a pleasant visit at ISKCON Newtown. Hare Krishna!',
         from: 'your_twilio_phone_number',
         to: mobile
       })
      .then(message => {
        console.log(message.sid)
        res.json({ success: true });
      })
      .catch(error => {
        console.error(error);
        res.json({ success: false });
      });
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
