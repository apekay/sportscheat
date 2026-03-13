import { getSupabaseAdmin } from '@/lib/supabase';

export interface SubscriptionStatus {
  isPro: boolean;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export async function getUserSubscription(
  userId: string
): Promise<SubscriptionStatus> {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('subscriptions')
      .select('status, current_period_end, cancel_at_period_end')
      .eq('user_id', userId)
      .single();

    if (!data) {
      return { isPro: false, status: 'inactive', currentPeriodEnd: null, cancelAtPeriodEnd: false };
    }

    const isPro =
      data.status === 'active' &&
      (!data.current_period_end || new Date(data.current_period_end) > new Date());

    return {
      isPro,
      status: data.status,
      currentPeriodEnd: data.current_period_end,
      cancelAtPeriodEnd: data.cancel_at_period_end || false,
    };
  } catch {
    // Supabase unavailable — default to free
    return { isPro: false, status: 'inactive', currentPeriodEnd: null, cancelAtPeriodEnd: false };
  }
}
