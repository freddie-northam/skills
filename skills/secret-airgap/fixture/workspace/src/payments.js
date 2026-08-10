import Stripe from 'stripe';

// Reads at import time, so a missing key fails at boot rather than at checkout.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function chargeOrder(orderId, amountCents) {
  return stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'gbp',
    metadata: { orderId },
  });
}
