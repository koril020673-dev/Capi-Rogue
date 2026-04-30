import { getUser } from './authEngine';
import { supabase } from '../lib/supabase';

const SAVE_KEY = 'capirogue-save-v1';
const RECORDS_KEY = 'capirogue-records-v1';

export function saveGameToLocalStorage(snapshot) {
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
}

export function loadGameFromLocalStorage() {
  const rawSave = window.localStorage.getItem(SAVE_KEY);

  if (!rawSave) {
    return null;
  }

  try {
    return JSON.parse(rawSave);
  } catch {
    return null;
  }
}

export function clearLocalSave() {
  window.localStorage.removeItem(SAVE_KEY);
}

export function loadRecordsFromLocalStorage() {
  const rawRecords = window.localStorage.getItem(RECORDS_KEY);

  if (!rawRecords) {
    return [];
  }

  try {
    const records = JSON.parse(rawRecords);

    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

export function saveRecordToLocalStorage(record) {
  const records = loadRecordsFromLocalStorage();

  window.localStorage.setItem(RECORDS_KEY, JSON.stringify([record, ...records].slice(0, 20)));
}

export async function saveGame(gameState) {
  if (!supabase) {
    return null;
  }

  try {
    const user = await getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('game_saves')
      .upsert(
        {
          user_id: user.id,
          game_state_json: gameState,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function loadGame() {
  if (!supabase) {
    return null;
  }

  try {
    const user = await getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('game_saves')
      .select('game_state_json')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data.game_state_json ?? null;
  } catch {
    return null;
  }
}

export async function saveRecord(recordData) {
  if (!supabase) {
    return null;
  }

  try {
    const user = await getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('records')
      .insert({
        ...recordData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function loadRecords() {
  if (!supabase) {
    return null;
  }

  try {
    const user = await getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('records')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error };
    }

    return { data: data ?? [], error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export function createSaveSnapshot(state) {
  return Object.freeze({
    session: state.session,
    playerProfile: state.playerProfile,
    selectedAdvisorId: state.selectedAdvisorId,
    selectedAdvisor: state.selectedAdvisor,
    floor: state.floor,
    phase: state.phase,
    player: state.player,
    strategy: state.strategy,
    rivals: state.rivals,
    marketEffects: state.marketEffects,
    currentExternalEvent: state.currentExternalEvent,
    currentRivalEvent: state.currentRivalEvent,
    lastExternalEvent: state.lastExternalEvent,
    currentInternalEvent: state.currentInternalEvent,
    currentInternalOutcome: state.currentInternalOutcome,
    currentSettlement: state.currentSettlement,
    currentResult: state.currentResult,
    rewardOptions: state.rewardOptions,
    momentumHistory: state.momentumHistory,
    timeline: state.timeline,
    metRivals: state.metRivals,
    playtime: state.playtime,
    championUnlocked: state.championUnlocked,
    runOutcome: state.runOutcome,
    unlockedAdvisorOrder: state.unlockedAdvisorOrder,
    legacyCards: state.legacyCards,
    // TODO: Legacy card stack cap is TBD by design.
  });
}
