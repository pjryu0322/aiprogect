import { useCallback, useEffect, useRef, useState } from 'react';

/** Browser storage key prefix; each draft is scoped by meeting or workspace id. */
export const TEMPORARY_SAVE_KEY_PREFIX = 'aiprogect:workspace:draft';

export type DraftSaveState = 'draft' | 'saving' | 'saved' | 'error';

export interface TemporarySaveRecord {
  version: 1;
  scope: string;
  value: string;
  savedAt: string;
  meetingId?: string;
}

export interface TemporarySaveOptions {
  scope: string;
  meetingId?: string;
  debounceMs?: number;
  initialValue?: string;
  restoreOnMount?: boolean;
}

export interface TemporarySaveResult {
  value: string;
  setValue: (next: string) => void;
  saveState: DraftSaveState;
  lastSavedAt: string | null;
  errorMessage: string | null;
  hasUnsavedChanges: boolean;
  saveNow: () => Promise<boolean>;
  retrySave: () => Promise<boolean>;
  clearDraft: () => void;
}

const STORAGE_VERSION = 1 as const;
const DEFAULT_DEBOUNCE_MS = 800;

function assertScope(scope: string): string {
  const trimmed = scope.trim();
  if (!trimmed) {
    throw new Error('Temporary save scope must be a non-empty string.');
  }
  return trimmed;
}

/**
 * Builds a scoped localStorage key for draft content.
 * Format: aiprogect:workspace:draft:{scope}
 */
export function buildTemporarySaveKey(scope: string): string {
  return `${TEMPORARY_SAVE_KEY_PREFIX}:${assertScope(scope)}`;
}

function parseStoredDraft(raw: string, expectedScope: string): TemporarySaveRecord | null {
  try {
    const parsed = JSON.parse(raw) as Partial<TemporarySaveRecord>;
    if (
      parsed.version !== STORAGE_VERSION ||
      parsed.scope !== expectedScope ||
      typeof parsed.value !== 'string' ||
      typeof parsed.savedAt !== 'string'
    ) {
      return null;
    }
    return parsed as TemporarySaveRecord;
  } catch {
    return null;
  }
}

function readStorage(scope: string): TemporarySaveRecord | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(buildTemporarySaveKey(scope));
    if (!raw) {
      return null;
    }
    return parseStoredDraft(raw, scope);
  } catch {
    return null;
  }
}

function writeStorage(scope: string, record: TemporarySaveRecord): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    throw new Error('브라우저 저장소를 사용할 수 없습니다.');
  }

  window.localStorage.setItem(buildTemporarySaveKey(scope), JSON.stringify(record));
}

function removeStorage(scope: string): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.removeItem(buildTemporarySaveKey(scope));
  } catch {
    // Ignore cleanup failures.
  }
}

export function loadTemporarySave(scope: string): TemporarySaveRecord | null {
  return readStorage(assertScope(scope));
}

export function saveTemporarySave(
  scope: string,
  value: string,
  meetingId?: string,
): TemporarySaveRecord {
  const normalizedScope = assertScope(scope);
  const record: TemporarySaveRecord = {
    version: STORAGE_VERSION,
    scope: normalizedScope,
    value,
    savedAt: new Date().toISOString(),
    ...(meetingId ? { meetingId } : {}),
  };

  writeStorage(normalizedScope, record);
  return record;
}

export function clearTemporarySave(scope: string): void {
  removeStorage(assertScope(scope));
}

/**
 * Persists draft text with explicit saving / saved / error states.
 * Used by workspace input and meeting draft editors.
 */
export function useTemporarySave({
  scope,
  meetingId,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  initialValue = '',
  restoreOnMount = true,
}: TemporarySaveOptions): TemporarySaveResult {
  const normalizedScope = assertScope(scope);
  const [value, setValueState] = useState(initialValue);
  const [saveState, setSaveState] = useState<DraftSaveState>('draft');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const valueRef = useRef(value);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restoredRef = useRef(false);

  valueRef.current = value;

  const persistValue = useCallback(
    async (nextValue: string): Promise<boolean> => {
      setSaveState('saving');
      setErrorMessage(null);

      try {
        const record = saveTemporarySave(normalizedScope, nextValue, meetingId);
        setLastSavedAt(record.savedAt);
        setSaveState('saved');
        setHasUnsavedChanges(false);
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : '임시 저장에 실패했습니다. 다시 시도해 주세요.';
        setErrorMessage(message);
        setSaveState('error');
        return false;
      }
    },
    [meetingId, normalizedScope],
  );

  const saveNow = useCallback(async (): Promise<boolean> => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    return persistValue(valueRef.current);
  }, [persistValue]);

  const retrySave = saveNow;

  const clearDraft = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    clearTemporarySave(normalizedScope);
    setValueState('');
    setLastSavedAt(null);
    setErrorMessage(null);
    setHasUnsavedChanges(false);
    setSaveState('draft');
  }, [normalizedScope]);

  const setValue = useCallback(
    (next: string) => {
      setValueState(next);
      setHasUnsavedChanges(true);
      setSaveState('draft');
      setErrorMessage(null);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        void persistValue(next);
      }, debounceMs);
    },
    [debounceMs, persistValue],
  );

  useEffect(() => {
    if (!restoreOnMount || restoredRef.current) {
      return;
    }

    restoredRef.current = true;
    const stored = loadTemporarySave(normalizedScope);
    if (!stored) {
      return;
    }

    setValueState(stored.value);
    setLastSavedAt(stored.savedAt);
    setSaveState('saved');
    setHasUnsavedChanges(false);
  }, [normalizedScope, restoreOnMount]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    value,
    setValue,
    saveState,
    lastSavedAt,
    errorMessage,
    hasUnsavedChanges,
    saveNow,
    retrySave,
    clearDraft,
  };
}
