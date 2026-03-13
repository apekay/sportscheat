import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getStripe, PRICES } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await request.json();
    const priceId = plan === 'yearly' ? PRICES.yearly : PRICES.monthly;

    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const stripe = getStripe();
    const supabase = getSupabaseAdmin();

    // Check for existing Stripe customer
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', session.user.id)
      .single();

    let customerId = sub?.stripe_customer_id;

    // Create Stripe customer if needed
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email!,
        metadata: { userId: session.user.id },
      });
      customerId = customer.id;

      // Upsert subscription row with customer ID
      await supabase.from('subscriptions').upsert({
        user_id: session.user.id,
        stripe_customer_id: customerId,
        status: 'inactive',
      }, { onConflict: 'user_id' });
    }

    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL}/v2?upgraded=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
      subscription_data: {
        metadata: { userId: session.user.id },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
