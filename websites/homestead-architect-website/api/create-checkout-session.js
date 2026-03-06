// api/create-checkout-session.js
// This is a serverless function that creates Stripe checkout sessions
// Deploy this to Vercel, Netlify, or your preferred serverless platform

const getStripeClient = () => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return require('stripe')(stripeSecretKey);
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stripe = getStripeClient();
    const { priceId, successUrl, cancelUrl } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: successUrl || 'https://homesteadarchitect.com/success',
      cancel_url: cancelUrl || 'https://homesteadarchitect.com/pricing',
      ui_mode: 'hosted',
      customer_creation: 'always',
      automatic_tax: { enabled: true },
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'PT', 'IE', 'PL', 'CZ', 'SK', 'HU', 'SI', 'HR', 'BA', 'RS', 'ME', 'MK', 'AL', 'GR', 'TR', 'CY', 'MT', 'IS', 'LI', 'MC', 'SM', 'VA']
      }
    });

    res.status(200).json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
}

// For local development with Express
if (require.main === module) {
  const express = require('express');
  const app = express();

  app.use(express.json());

  app.post('/api/create-checkout-session', handler);

  const PORT = process.env.PORT || 4242;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
