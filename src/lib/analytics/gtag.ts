// ============================================
// Google Ads (AdWords) conversion tracking
// No-op when NEXT_PUBLIC_GOOGLE_ADS_ID is not set
// ============================================

export const GA_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? '';

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    gtag: (...args: unknown[]) => void;
  }
}

/** Whether tracking is active (env var set + browser context) */
export function isTrackingEnabled(): boolean {
  return GA_ADS_ID !== '' && typeof window !== 'undefined';
}

/** Core gtag wrapper — no-op if env var missing, console.log in dev */
function gtagSafe(...args: unknown[]): void {
  if (!isTrackingEnabled()) return;

  if (process.env.NODE_ENV === 'development') {
    console.log('[gtag]', ...args);
    return;
  }

  window.gtag?.(...args);
}

// ============================================
// Public API
// ============================================

/** Track a Google Ads conversion (requires conversion label from Google Ads console) */
export function trackConversion(
  conversionLabel: string,
  params?: Record<string, unknown>
): void {
  gtagSafe('event', 'conversion', {
    send_to: `${GA_ADS_ID}/${conversionLabel}`,
    ...params,
  });
}

/** Track a custom event for Google Ads optimization */
export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  gtagSafe('event', eventName, params);
}

// ============================================
// Typed event helpers — used by components
// ============================================

/** User selects bold or swipe view mode */
export function trackViewModeSelected(mode: 'bold' | 'swipe'): void {
  trackEvent('view_mode_selected', { view_mode: mode });
}

/** Digest successfully loaded */
export function trackDigestLoaded(storyCount: number): void {
  trackEvent('digest_loaded', { story_count: storyCount });
}

/** User flipped a card to read the full story */
export function trackCardEngaged(storyId: string, sport: string): void {
  trackEvent('card_engaged', { story_id: storyId, sport });
}

/** User marked a story as "I got this" */
export function trackStoryMemorized(storyId: string, sport: string): void {
  trackEvent('story_memorized', { story_id: storyId, sport });
}

/** User manually refreshed the digest */
export function trackDigestRefreshed(): void {
  trackEvent('digest_refreshed');
}
