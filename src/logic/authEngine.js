import { supabase } from '../lib/supabase';

function missingClientResult() {
  return {
    user: null,
    error: new Error('Supabase environment variables are not configured.'),
  };
}

function alreadyExistsError() {
  const error = new Error('User already exists');
  error.code = 'USER_ALREADY_EXISTS';

  return error;
}

function isAlreadyExistsError(error) {
  const message = String(error?.message ?? '').toLowerCase();

  return error?.code === 'user_already_exists'
    || message.includes('already')
    || message.includes('registered');
}

export async function signUp(email, password) {
  if (!supabase) {
    return missingClientResult();
  }

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    const identities = data?.user?.identities;

    if (identities && identities.length === 0) {
      return {
        user: null,
        error: alreadyExistsError(),
      };
    }

    if (isAlreadyExistsError(error)) {
      return {
        user: null,
        error: alreadyExistsError(),
      };
    }

    return {
      user: data?.user ?? null,
      error: error ?? null,
    };
  } catch (error) {
    return {
      user: null,
      error,
    };
  }
}

export async function signIn(email, password) {
  if (!supabase) {
    return missingClientResult();
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    return {
      user: data?.user ?? null,
      error: error ?? null,
    };
  } catch (error) {
    return {
      user: null,
      error,
    };
  }
}

export async function signOut() {
  if (!supabase) {
    return { error: null };
  }

  try {
    const { error } = await supabase.auth.signOut();

    return { error: error ?? null };
  } catch (error) {
    return { error };
  }
}

export async function getUser() {
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return null;
    }

    return data?.user ?? null;
  } catch {
    return null;
  }
}
