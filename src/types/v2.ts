// ============================================
// Sporting Chance v2.0 — Multi-Channel, Auto-Generated
// Extends v1.1 types with storage + distribution
// ============================================

// Re-export everything from v1.1
export * from './v1.1';

// ---- Subscriber for multi-channel distribution ----

export type DistributionChannel = 'sms' | 'email' | 'slack' | 'discord';

export interface Subscriber {
  id: string;
  channel: DistributionChannel;
  target: string; // phone number, email, webhook URL
  active: boolean;
  createdAt: string;
}

// ---- Cached digest metadata ----

export interface CachedDigest {
  digest: import('./v1.1').DailyDigestV2;
  cachedAt: string;
  expiresAt: string;
}

// ---- Distribution log entry ----

export interface DistributionLog {
  subscriberId: string;
  channel: DistributionChannel;
  sentAt: string;
  success: boolean;
  error?: string;
}
