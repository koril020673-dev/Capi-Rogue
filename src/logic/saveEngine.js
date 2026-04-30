const SAVE_KEY = 'capirogue2-save-v1';
const RECORDS_KEY = 'capirogue2-records-v1';

// TODO: Backend provider is TBD. Replace localStorage with Supabase/Firebase sync here.
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

export function createSaveSnapshot(state) {
  return Object.freeze({
    session: state.session,
    playerProfile: state.playerProfile,
    unlockedAdvisorOrder: state.unlockedAdvisorOrder,
    legacyCards: state.legacyCards,
    // TODO: Legacy card stack cap is TBD by design.
  });
}
