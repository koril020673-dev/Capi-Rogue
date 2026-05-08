import { supabase } from '../lib/supabase';

const SAVE_KEY = 'capirogue-save-v1';
const SAVE_SLOTS_KEY = 'capirogue-save-slots-v1';
const RECORDS_KEY = 'capirogue-records-v1';

export const SAVE_SLOT_COUNT = 5;

export function saveGameToLocalStorage(snapshot) {
  saveGameSlotToLocalStorage(snapshot?.currentSlot ?? 1, snapshot);
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
}

export function loadGameFromLocalStorage() {
  const firstSlot = loadSaveSlotFromLocalStorage(1);

  if (firstSlot) {
    return firstSlot;
  }

  return loadLegacySave();
}

export function clearLocalSave() {
  window.localStorage.removeItem(SAVE_KEY);
  window.localStorage.removeItem(SAVE_SLOTS_KEY);
}

export function saveGameSlotToLocalStorage(slotNumber, snapshot) {
  const safeSlotNumber = normalizeSlotNumber(slotNumber);
  const slots = loadSaveSlotsFromLocalStorage();
  const nextSnapshot = Object.freeze({
    ...snapshot,
    currentSlot: safeSlotNumber,
    slotId: safeSlotNumber,
    savedAt: new Date().toISOString(),
  });
  const nextSlots = slots.map((slot) => (
    slot.id === safeSlotNumber
      ? Object.freeze({ ...slot, snapshot: nextSnapshot })
      : slot
  ));

  window.localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(nextSlots));
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(nextSnapshot));

  return nextSnapshot;
}

export function loadSaveSlotFromLocalStorage(slotNumber) {
  const safeSlotNumber = normalizeSlotNumber(slotNumber);

  return loadSaveSlotsFromLocalStorage().find((slot) => slot.id === safeSlotNumber)?.snapshot ?? null;
}

export function loadSaveSlotsFromLocalStorage() {
  const emptySlots = createEmptyLocalSlots();

  try {
    const rawSlots = window.localStorage.getItem(SAVE_SLOTS_KEY);

    if (rawSlots) {
      const parsedSlots = JSON.parse(rawSlots);

      if (Array.isArray(parsedSlots)) {
        return emptySlots.map((emptySlot) => {
          const savedSlot = parsedSlots.find((slot) => {
            const id = Number(slot?.id ?? slot?.slotNumber);

            return id === emptySlot.id;
          });

          return Object.freeze({
            ...emptySlot,
            snapshot: savedSlot?.snapshot ?? savedSlot?.data ?? null,
          });
        });
      }
    }
  } catch {
    return emptySlots;
  }

  const legacySave = loadLegacySave();

  if (!legacySave) {
    return emptySlots;
  }

  return emptySlots.map((slot) => (
    slot.id === 1
      ? Object.freeze({ ...slot, snapshot: legacySave })
      : slot
  ));
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

export async function saveGame(gameState, slotNumber = 1) {
  if (!isValidSlotNumber(slotNumber)) {
    console.error('saveGame failed: slotNumber must be between 1 and 5.');
    return false;
  }

  if (!supabase) {
    return false;
  }

  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return null;
    }

    const { error } = await supabase
      .from('game_saves')
      .upsert(
        {
          user_id: userId,
          slot_number: Number(slotNumber),
          game_state_json: gameState,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,slot_number' },
      );

    if (error) {
      console.error('saveGame failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('saveGame failed:', error);
    return false;
  }
}

export async function saveOnFloorEnter(gameState) {
  const slotNumber = gameState?.currentSlot ?? 1;

  if (!isValidSlotNumber(slotNumber)) {
    console.error('saveOnFloorEnter failed: slotNumber must be between 1 and 5.');
    return false;
  }

  const snapshot = createSaveSnapshot({
    ...gameState,
    currentInternalEvent: null,
    currentInternalOutcome: null,
    currentSettlement: null,
    currentResult: null,
    rewardOptions: Object.freeze([]),
    screen: 'main',
  });

  saveGameSlotToLocalStorage(slotNumber, snapshot);

  const saved = await saveGame(snapshot, slotNumber);

  if (saved === false) {
    console.error('saveOnFloorEnter failed: remote save failed.');
  }

  return saved;
}

export async function loadGame(slotNumber = 1) {
  if (!isValidSlotNumber(slotNumber)) {
    console.error('loadGame failed: slotNumber must be between 1 and 5.');
    return null;
  }

  if (!supabase) {
    return null;
  }

  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return null;
    }

    const { data, error } = await supabase
      .from('game_saves')
      .select('game_state_json')
      .eq('user_id', userId)
      .eq('slot_number', Number(slotNumber))
      .maybeSingle();

    if (error) {
      console.error('loadGame failed:', error);
      return null;
    }

    return data?.game_state_json ?? null;
  } catch (error) {
    console.error('loadGame failed:', error);
    return null;
  }
}

export async function getAllSlots() {
  if (!supabase) {
    return null;
  }

  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return null;
    }

    const { data, error } = await supabase
      .from('game_saves')
      .select('slot_number, game_state_json, updated_at')
      .eq('user_id', userId)
      .order('slot_number', { ascending: true });

    if (error) {
      console.error('getAllSlots failed:', error);
      return null;
    }

    return createEmptyRemoteSlots().map((emptySlot) => {
      const savedSlot = data?.find((slot) => Number(slot.slot_number) === emptySlot.slotNumber);

      return Object.freeze({
        slotNumber: emptySlot.slotNumber,
        data: savedSlot?.game_state_json ?? null,
        updatedAt: savedSlot?.updated_at ?? null,
      });
    });
  } catch (error) {
    console.error('getAllSlots failed:', error);
    return null;
  }
}

export async function deleteSlot(slotNumber) {
  // TODO: Wire this into a slot reset button when the UI is designed.
  if (!isValidSlotNumber(slotNumber)) {
    console.error('deleteSlot failed: slotNumber must be between 1 and 5.');
    return false;
  }

  if (!supabase) {
    return false;
  }

  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return null;
    }

    const { error } = await supabase
      .from('game_saves')
      .delete()
      .eq('user_id', userId)
      .eq('slot_number', Number(slotNumber));

    if (error) {
      console.error('deleteSlot failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('deleteSlot failed:', error);
    return false;
  }
}

export async function saveRecord(recordData) {
  const nextRecord = Object.freeze({
    result_type: recordData?.result_type ?? 'CLEAR',
    clear_grade: recordData?.clear_grade ?? null,
    ...recordData,
  });

  saveRecordToLocalStorage(nextRecord);

  if (!supabase) {
    return false;
  }

  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return null;
    }

    const { error } = await supabase
      .from('records')
      .insert({
        ...nextRecord,
        user_id: userId,
      });

    if (error) {
      console.error('saveRecord failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('saveRecord failed:', error);
    return false;
  }
}

export async function loadAllRecords(resultType = null) {
  if (!supabase) {
    const localRecords = loadRecordsFromLocalStorage()
      .filter((record) => ['CLEAR', 'BANKRUPT'].includes(record.result_type))
      .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
      .slice(0, 10);

    return resultType
      ? localRecords.filter((record) => record.result_type === resultType)
      : localRecords;
  }

  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return [];
    }

    let query = supabase
      .from('records')
      .select('*')
      .eq('user_id', userId)
      .in('result_type', ['CLEAR', 'BANKRUPT'])
      .order('created_at', { ascending: false })
      .limit(10);

    if (resultType) {
      query = query.eq('result_type', resultType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('loadAllRecords failed:', error);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error('loadAllRecords failed:', error);
    return [];
  }
}

export async function loadRecords() {
  const data = await loadAllRecords();

  return { data, error: null };
}

export function createSaveSnapshot(state) {
  return Object.freeze({
    screen: state.screen,
    currentSlot: state.currentSlot,
    session: state.session,
    playerProfile: state.playerProfile,
    selectedAdvisorId: state.selectedAdvisorId,
    selectedAdvisor: state.selectedAdvisor,
    floor: state.floor,
    phase: state.phase,
    player: state.player,
    strategy: state.strategy,
    hasClickedStrategyTab: state.hasClickedStrategyTab,
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
    completedTutorials: state.completedTutorials,
    unlockedAchievements: state.unlockedAchievements,
    newAchievements: state.newAchievements,
    userType: state.userType,
    playtime: state.playtime,
    qualityUpgradeCount: state.qualityUpgradeCount,
    costReductionCount: state.costReductionCount,
    factoryFailStreak: state.factoryFailStreak,
    costReductionFailStreak: state.costReductionFailStreak,
    championUnlocked: state.championUnlocked,
    runOutcome: state.runOutcome,
    unlockedAdvisorOrder: state.unlockedAdvisorOrder,
    legacyCards: state.legacyCards,
    // TODO: Legacy card stack cap is TBD by design.
  });
}

function createEmptyLocalSlots() {
  return Array.from({ length: SAVE_SLOT_COUNT }, (_, index) => Object.freeze({
    id: index + 1,
    snapshot: null,
  }));
}

function createEmptyRemoteSlots() {
  return Array.from({ length: SAVE_SLOT_COUNT }, (_, index) => Object.freeze({
    slotNumber: index + 1,
    data: null,
    updatedAt: null,
  }));
}

function normalizeSlotNumber(slotNumber) {
  const parsedSlotNumber = Math.round(Number(slotNumber) || 1);

  return Math.max(1, Math.min(SAVE_SLOT_COUNT, parsedSlotNumber));
}

function isValidSlotNumber(slotNumber) {
  const parsedSlotNumber = Number(slotNumber);

  return Number.isInteger(parsedSlotNumber) && parsedSlotNumber >= 1 && parsedSlotNumber <= SAVE_SLOT_COUNT;
}

async function getCurrentUserId() {
  const { useGameStore } = await import('../store/useGameStore');

  return useGameStore.getState().playerId ?? null;
}

function loadLegacySave() {
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
