export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  try {
    const { name, email, subject, message, 'cf-turnstile-response': turnstileToken } = req.body;

    // 1. Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Required fields (Name, Email, Message) are missing.' });
    }

    if (!turnstileToken) {
      return res.status(400).json({ success: false, message: 'CAPTCHA verification token is missing.' });
    }

    // Load and defensively clean environment variables of any quotes or trailing spaces
    const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY?.trim().replace(/^["']|["']$/g, '');
    const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim().replace(/^["']|["']$/g, '');

    if (!TURNSTILE_SECRET || !RESEND_API_KEY) {
      console.error('Server configuration error: Missing environment variables.');
      return res.status(500).json({ success: false, message: 'Server configuration error. Please try again later.' });
    }

    // 2. Verify Turnstile Token with Cloudflare API
    const verifyCaptcha = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: TURNSTILE_SECRET,
        response: turnstileToken,
      })
    });

    const captchaOutcome = await verifyCaptcha.json();
    if (!captchaOutcome.success) {
      return res.status(400).json({ success: false, message: 'CAPTCHA verification failed. Please try again.' });
    }

    // 3. Send Email via Resend API (Native fetch to avoid npm dependency)
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Portfolio Contact <onboarding@resend.dev>',
        to: 'hmt.dushmantha@gmail.com',
        reply_to: email,
        subject: subject || 'New Portfolio Contact Form Submission',
        html: `
          <h3>New message from your portfolio</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `
      })
    });

    const data = await resendResponse.json();

    if (resendResponse.ok) {
      return res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } else {
      console.error('Resend API Error Response:', data);
      return res.status(400).json({ success: false, message: data.message || 'Failed to send email via Resend.' });
    }
  } catch (error) {
    console.error('Backend contact handler error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error. Please try again later.' });
  }
}
