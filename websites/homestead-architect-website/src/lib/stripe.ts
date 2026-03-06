// src/lib/stripe.ts
import { loadStripe } from '@stripe/stripe-js';

// This will be set via environment variables
export const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_live_placeholder'
);

// Pricing configuration
export interface PricingTier {
  id: string;
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  monthlyPriceId: string; // Stripe monthly price ID
  yearlyPriceId: string; // Stripe yearly price ID
  description: string;
  features: string[];
  popular?: boolean;
}

export const pricingTiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: '$0',
    yearlyPrice: '$0',
    monthlyPriceId: '', // No Stripe price for free tier
    yearlyPriceId: '',
    description: 'Perfect for getting started',
    features: [
      'Up to 2 properties',
      'Basic layout planning',
      'Community support',
      'Standard templates'
    ]
  },
  {
    id: 'basic',
    name: 'Basic',
    monthlyPrice: '$4.99/month',
    yearlyPrice: '$29.99/year',
    monthlyPriceId: 'price_1SjMSiL4MuRaMM4CHYCyQf6F', // Basic Plan Monthly
    yearlyPriceId: 'price_1SjMSiL4MuRaMM4CLhZnK7UJ', // Basic Plan Yearly
    description: 'For growing homesteads',
    features: [
      'Up to 10 properties',
      'Advanced layout tools',
      'Email support',
      'Custom templates',
      'Property sharing'
    ],
    popular: true
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: '$19.99/month',
    yearlyPrice: '$229.99/year',
    monthlyPriceId: 'price_1SjMTOL4MuRaMM4C209NcRgl', // Pro Plan Monthly
    yearlyPriceId: 'price_1SjMTOL4MuRaMM4CPbRJ5O86', // Pro Plan Yearly
    description: 'For serious homesteaders',
    features: [
      'Unlimited properties',
      '3D property visualization',
      'Priority support',
      'Export to CAD files',
      'API access',
      'Advanced analytics'
    ]
  }
];

// Function to create checkout session
export const createCheckoutSession = async (
  priceId: string, 
  email: string,
  plan: string,
  successUrl?: string, 
  cancelUrl?: string
) => {
  try {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        email,
        plan,
        successUrl: successUrl || `${window.location.origin}/checkout-complete`,
        cancelUrl: cancelUrl || `${window.location.origin}/pricing`
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};
