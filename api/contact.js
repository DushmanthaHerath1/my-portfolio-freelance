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

    const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;
    const WEB3FORMS_KEY = process.env.WEB3FORMS_ACCESS_KEY;

    if (!TURNSTILE_SECRET || !WEB3FORMS_KEY) {
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

    // 3. Send Email via Web3Forms
    const web3Response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        name: name,
        email: email,
        subject: subject || 'New Portfolio Contact Form Submission',
        message: message,
        from_name: name
      })
    });

    const data = await web3Response.json();
    if (web3Response.ok && data.success) {
      return res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } else {
      return res.status(400).json({ success: false, message: data.message || 'Failed to send message via email handler.' });
    }
  } catch (error) {
    console.error('Contact form submission error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error. Please try again later.' });
  }
}
