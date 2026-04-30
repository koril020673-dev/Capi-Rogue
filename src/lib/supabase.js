import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const normalizedSupabaseUrl = typeof supabaseUrl === 'string' ? supabaseUrl.trim().replace(/\/+$/, '') : '';
const normalizedAnonKey = typeof supabaseAnonKey === 'string' ? supabaseAnonKey.trim() : '';

function getConfigError() {
  if (!normalizedSupabaseUrl || !normalizedAnonKey) {
    return 'MISSING_SUPABASE_ENV';
  }

  try {
    const url = new URL(normalizedSupabaseUrl);
    const hasDashboardPath = url.hostname === 'supabase.com' || url.pathname !== '/';
    const isSupabaseApiHost = url.protocol === 'https:' && url.hostname.endsWith('.supabase.co');

    if (!isSupabaseApiHost || hasDashboardPath) {
      return 'INVALID_SUPABASE_URL';
    }
  } catch {
    return 'INVALID_SUPABASE_URL';
  }

  if (!normalizedAnonKey.startsWith('eyJ') && !normalizedAnonKey.startsWith('sb_publishable_')) {
    return 'INVALID_SUPABASE_ANON_KEY';
  }

  return null;
}

export const supabaseConfigError = getConfigError();

export const supabase = supabaseConfigError === null
  ? createClient(normalizedSupabaseUrl, normalizedAnonKey)
  : null;

export function getSupabaseConfigStatus() {
  return {
    configured: supabaseConfigError === null,
    error: supabaseConfigError,
  };
}
