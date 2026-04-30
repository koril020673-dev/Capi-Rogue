import { supabase } from '../lib/supabase';

function missingClientResult() {
  return {
    user: null,
    error: new Error('Supabase 환경변수가 설정되지 않았습니다.'),
  };
}

export async function signUp(email, password) {
  if (!supabase) {
    return missingClientResult();
  }

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    const identities = data?.user?.identities;

    return {
      user: identities && identities.length === 0 ? null : data?.user ?? null,
      error: error ?? (identities && identities.length === 0 ? new Error('User already exists') : null),
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
