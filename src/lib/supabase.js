import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const normalizedSupabaseUrl = normalizeSupabaseUrl(supabaseUrl);
const normalizedAnonKey = normalizeEnvValue(supabaseAnonKey);

function normalizeEnvValue(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/^[A-Z0-9_]+\s*=\s*/i, '')
    .trim()
    .replace(/^['"]|['"]$/g, '');
}

function normalizeSupabaseUrl(value) {
  const rawUrl = normalizeEnvValue(value).replace(/\/+$/, '');

  if (!rawUrl) {
    return '';
  }

  try {
    const url = new URL(rawUrl);

    if (url.hostname.endsWith('.supabase.co')) {
      return `${url.protocol}//${url.hostname}`;
    }

    const dashboardProject = rawUrl.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);

    if (dashboardProject?.[1]) {
      return `https://${dashboardProject[1]}.supabase.co`;
    }
  } catch {
    const projectRefOnly = rawUrl.match(/^([a-z0-9]{20})$/i);

    if (projectRefOnly?.[1]) {
      return `https://${projectRefOnly[1]}.supabase.co`;
    }
  }

  return rawUrl;
}

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
