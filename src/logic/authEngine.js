import { supabase, supabaseConfigError } from '../lib/supabase';

const AUTH_KEY = 'cr2_auth';
const ACCOUNTS_TABLE = 'player_accounts';

function createError(message, code) {
  const error = new Error(message);
  error.code = code;

  return error;
}

function missingClientResult() {
  return {
    user: null,
    error: createError(
      supabaseConfigError ?? 'Supabase environment variables are not configured.',
      supabaseConfigError ?? 'MISSING_SUPABASE_ENV',
    ),
  };
}

function normalizeUsername(username) {
  return String(username ?? '').trim().toLowerCase();
}

function toPublicUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name ?? row.username,
    user_type: row.user_type ?? 'general',
  };
}

export function saveAuthToken(username, userId) {
  if (typeof window === 'undefined' || !username || !userId) {
    return;
  }

  try {
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7;

    window.localStorage.setItem(AUTH_KEY, JSON.stringify({
      username,
      userId,
      expiresAt,
    }));
  } catch {
    console.error('자동 로그인 토큰 저장 실패');
  }
}

export function loadAuthToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawSession = window.localStorage.getItem(AUTH_KEY);
    const parsed = rawSession ? JSON.parse(rawSession) : null;

    if (!parsed) {
      return null;
    }

    if (Date.now() > parsed.expiresAt) {
      clearAuthToken();
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearAuthToken() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_KEY);
}

async function hashPassword(username, password) {
  const source = `capirogue:${normalizeUsername(username)}:${password}`;
  const bytes = new TextEncoder().encode(source);
  const digest = await window.crypto.subtle.digest('SHA-256', bytes);

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function isMissingRow(error) {
  return error?.code === 'PGRST116';
}

function normalizeDbError(error) {
  if (!error) {
    return null;
  }

  if (error.code === '23505') {
    return createError('User already exists', 'USER_ALREADY_EXISTS');
  }

  if (error.code === '42P01') {
    return createError('player_accounts table does not exist', 'ACCOUNTS_TABLE_MISSING');
  }

  if (error.code === '42501') {
    return createError('Supabase policy blocked account access', 'ACCOUNTS_POLICY_BLOCKED');
  }

  return error;
}

export async function signUp(username, password) {
  if (!supabase) {
    return missingClientResult();
  }

  const normalizedUsername = normalizeUsername(username);

  if (!normalizedUsername || !password) {
    return {
      user: null,
      error: createError('Missing username or password', 'MISSING_CREDENTIALS'),
    };
  }

  try {
    const passwordHash = await hashPassword(normalizedUsername, password);
    const { data, error } = await supabase
      .from(ACCOUNTS_TABLE)
      .insert({
        username: normalizedUsername,
        display_name: String(username).trim(),
        password_hash: passwordHash,
      })
      .select('id, username, display_name, user_type')
      .single();

    if (error) {
      return {
        user: null,
        error: normalizeDbError(error),
      };
    }

    const user = toPublicUser(data);

    return {
      user,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error,
    };
  }
}

export async function signIn(username, password, options = {}) {
  if (!supabase) {
    return missingClientResult();
  }

  const normalizedUsername = normalizeUsername(username);

  if (!normalizedUsername || !password) {
    return {
      user: null,
      error: createError('Missing username or password', 'MISSING_CREDENTIALS'),
    };
  }

  try {
    const { data, error } = await supabase
      .from(ACCOUNTS_TABLE)
      .select('id, username, display_name, user_type, password_hash')
      .eq('username', normalizedUsername)
      .maybeSingle();

    if (error && !isMissingRow(error)) {
      return {
        user: null,
        error: normalizeDbError(error),
      };
    }

    if (!data) {
      return {
        user: null,
        error: createError('User not found', 'USER_NOT_FOUND'),
      };
    }

    const passwordHash = await hashPassword(normalizedUsername, password);

    if (passwordHash !== data.password_hash) {
      return {
        user: null,
        error: createError('Wrong password', 'WRONG_PASSWORD'),
      };
    }

    const user = toPublicUser(data);

    if (options.remember !== false) {
      saveAuthToken(user.username, user.id);
    }

    await hydratePlayerSession(user);

    return {
      user,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error,
    };
  }
}

export async function signOut() {
  clearAuthToken();
  await clearPlayerSession();

  return { error: null };
}

export async function getUser() {
  const token = loadAuthToken();

  if (!token) {
    return null;
  }

  return {
    id: token.userId,
    username: token.username,
    displayName: token.username,
  };
}

export async function tryAutoLogin() {
  const token = loadAuthToken();

  if (!token || !supabase) {
    if (!supabase) {
      clearAuthToken();
    }

    return false;
  }

  try {
    const { data, error } = await supabase
      .from(ACCOUNTS_TABLE)
      .select('id, username, display_name, user_type')
      .eq('id', token.userId)
      .single();

    if (error || !data) {
      clearAuthToken();
      return false;
    }

    await hydratePlayerSession(toPublicUser(data));
    return true;
  } catch {
    clearAuthToken();
    return false;
  }
}

async function hydratePlayerSession(user) {
  try {
    const { useGameStore } = await import('../store/useGameStore');

    useGameStore.getState().setPlayerId(user?.id ?? null);
    useGameStore.getState().setAuthenticatedSession?.(user);

    if (user?.id) {
      const { getAllSlots } = await import('./saveEngine');

      await getAllSlots();
    }
  } catch (error) {
    console.error('Failed to hydrate player session:', error);
  }
}

async function clearPlayerSession() {
  try {
    const { useGameStore } = await import('../store/useGameStore');

    useGameStore.getState().setPlayerId(null);
  } catch (error) {
    console.error('Failed to clear player session:', error);
  }
}
