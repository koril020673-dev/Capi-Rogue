import { supabase, supabaseConfigError } from '../lib/supabase';

const SESSION_KEY = 'capirogue-player-session-v1';
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
  };
}

function saveSession(user) {
  if (typeof window === 'undefined' || !user) {
    return;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function loadSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawSession = window.localStorage.getItem(SESSION_KEY);

    return rawSession ? JSON.parse(rawSession) : null;
  } catch {
    return null;
  }
}

function clearSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(SESSION_KEY);
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
      .select('id, username, display_name')
      .single();

    if (error) {
      return {
        user: null,
        error: normalizeDbError(error),
      };
    }

    const user = toPublicUser(data);
    saveSession(user);

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

export async function signIn(username, password) {
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
      .select('id, username, display_name, password_hash')
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
    saveSession(user);

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
  clearSession();

  return { error: null };
}

export async function getUser() {
  return loadSession();
}
