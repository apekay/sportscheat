import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('Missing STRIPE_SECRET_KEY');
  }

  stripeInstance = new Stripe(key, {
    apiVersion: '2026-02-25.clover',
    typescript: true,
  });

  return stripeInstance;
}

export const PRICES = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID || '',
  yearly: process.env.STRIPE_YEARLY_PRICE_ID || '',
} as const;
