'use client';

import { useSyncExternalStore } from 'react';
import { Palette } from 'lucide-react';

/**
 * Reading-skin picker. The default "Fast" skin is token-defined in
 * globals.css; the others override those tokens via [data-skin=...].
 * Choice persists in localStorage and is applied pre-hydration by the
 * inline script in layout.tsx.
 */
const SKINS = [
  { id: '', label: 'Fast' },
  { id: 'newsprint', label: 'Paper' },
  { id: 'wire', label: 'Wire' },
  { id: 'jumbotron', label: 'Jumbo' },
] as const;

export const SKIN_STORAGE_KEY = 'sc-skin';

/* The <html data-skin> attribute is the store; the picker is its only
   writer after the pre-hydration script runs. */
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const getSnapshot = () => document.documentElement.dataset.skin || '';
const getServerSnapshot = () => '';

function applySkin(id: string) {
  if (id) {
    document.documentElement.dataset.skin = id;
  } else {
    delete document.documentElement.dataset.skin;
  }
  listeners.forEach((cb) => cb());
}

export function SkinPicker() {
  const skin = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const cycle = () => {
    const idx = SKINS.findIndex((s) => s.id === skin);
    const next = SKINS[(idx + 1) % SKINS.length];
    applySkin(next.id);
    try {
      localStorage.setItem(SKIN_STORAGE_KEY, next.id);
    } catch {
      /* private mode */
    }
  };

  const current = SKINS.find((s) => s.id === skin) || SKINS[0];

  return (
    <button
      onClick={cycle}
      title={`Reading skin: ${current.label} — tap to switch`}
      className="inline-flex items-center gap-1 rounded-lg bg-warm-50 px-2.5 py-1.5 text-xs font-medium text-warm-700 hover:bg-warm-100 transition-colors"
    >
      <Palette className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{current.label}</span>
    </button>
  );
}
