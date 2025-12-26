document.addEventListener('DOMContentLoaded', () => {
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    const feedbackForm = document.getElementById('feedbackForm');
    const message = document.getElementById('message');

    sendOtpBtn.addEventListener('click', async () => {
        const mobile = document.getElementById('mobile').value;
        if (!mobile) {
            message.textContent = 'Please enter a mobile number.';
            return;
        }

        try {
            const response = await fetch('/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile })
            });
            const data = await response.json();

            if (data.success) {
                step1.style.display = 'none';
                step2.style.display = 'block';
                message.textContent = 'OTP sent to your mobile.';
            } else {
                message.textContent = 'Failed to send OTP. Please try again.';
            }
        } catch (error) {
            message.textContent = 'An error occurred. Please try again.';
        }
    });

    verifyOtpBtn.addEventListener('click', async () => {
        const mobile = document.getElementById('mobile').value;
        const otp = document.getElementById('otp').value;
        if (!otp) {
            message.textContent = 'Please enter the OTP.';
            return;
        }

        try {
            const response = await fetch('/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile, otp })
            });
            const data = await response.json();

            if (data.success) {
                step2.style.display = 'none';
                step3.style.display = 'block';
                message.textContent = 'Mobile number verified.';
            } else {
                message.textContent = 'Invalid OTP. Please try again.';
            }
        } catch (error) {
            message.textContent = 'An error occurred. Please try again.';
        }
    });

    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const mobile = document.getElementById('mobile').value;
        const visit = document.querySelector('input[name="visit"]:checked').value;

        try {
            // Send feedback to server and thank you sms
            const response = await fetch('/send-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile })
            });
            const data = await response.json();

            if(data.success){
                message.textContent = 'Thank you for your feedback!';
                feedbackForm.reset();
                step3.style.display = 'none';
                step1.style.display = 'block';
            } else {
                message.textContent = 'An error occurred while submitting feedback.';
            }

        } catch (error) {
            message.textContent = 'An error occurred while submitting feedback.';
        }
    });
});
