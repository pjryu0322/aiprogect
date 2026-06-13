export const TEMPORARY_SAVE_NAMESPACE = "aiprogect";
export const TEMPORARY_SAVE_SCOPE = "workspace";
export const TEMPORARY_SAVE_KIND = "draft";

export type TemporarySaveField =
  | "meeting-info"
  | "draft-content"
  | "workspace-input";

export interface TemporarySaveScope {
  field: TemporarySaveField;
  meetingId?: string;
}

export interface TemporarySavePayload<T = unknown> {
  data: T;
  savedAt: string;
  version: number;
}

export interface TemporarySaveHelperOptions<T> {
  scope: TemporarySaveScope;
  storage?: Storage;
  version?: number;
  onSave?: (payload: TemporarySavePayload<T>) => void;
  onLoad?: (payload: TemporarySavePayload<T> | null) => void;
  onClear?: () => void;
  onError?: (error: Error) => void;
}

export interface TemporarySaveHelper<T> {
  getKey: () => string;
  save: (data: T) => boolean;
  load: () => TemporarySavePayload<T> | null;
  clear: () => boolean;
  hasDraft: () => boolean;
}

const DEFAULT_VERSION = 1;

function getStorage(storage?: Storage): Storage | null {
  if (storage) {
    return storage;
  }

  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function buildTemporarySaveKey(scope: TemporarySaveScope): string {
  const meetingSegment = scope.meetingId?.trim() || "session";
  return [
    TEMPORARY_SAVE_NAMESPACE,
    TEMPORARY_SAVE_SCOPE,
    TEMPORARY_SAVE_KIND,
    meetingSegment,
    scope.field,
  ].join(":");
}

function createPayload<T>(
  data: T,
  version: number
): TemporarySavePayload<T> {
  return {
    data,
    savedAt: new Date().toISOString(),
    version,
  };
}

function parsePayload<T>(raw: string): TemporarySavePayload<T> | null {
  try {
    const parsed = JSON.parse(raw) as TemporarySavePayload<T>;

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("data" in parsed) ||
      typeof parsed.savedAt !== "string"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function saveTemporaryDraft<T>(
  scope: TemporarySaveScope,
  data: T,
  storage?: Storage,
  version = DEFAULT_VERSION
): boolean {
  const targetStorage = getStorage(storage);

  if (!targetStorage) {
    return false;
  }

  try {
    const payload = createPayload(data, version);
    targetStorage.setItem(buildTemporarySaveKey(scope), JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function loadTemporaryDraft<T>(
  scope: TemporarySaveScope,
  storage?: Storage
): TemporarySavePayload<T> | null {
  const targetStorage = getStorage(storage);

  if (!targetStorage) {
    return null;
  }

  const raw = targetStorage.getItem(buildTemporarySaveKey(scope));

  if (!raw) {
    return null;
  }

  return parsePayload<T>(raw);
}

export function clearTemporaryDraft(
  scope: TemporarySaveScope,
  storage?: Storage
): boolean {
  const targetStorage = getStorage(storage);

  if (!targetStorage) {
    return false;
  }

  try {
    targetStorage.removeItem(buildTemporarySaveKey(scope));
    return true;
  } catch {
    return false;
  }
}

export function hasTemporaryDraft(
  scope: TemporarySaveScope,
  storage?: Storage
): boolean {
  const targetStorage = getStorage(storage);

  if (!targetStorage) {
    return false;
  }

  return targetStorage.getItem(buildTemporarySaveKey(scope)) !== null;
}

export function createTemporarySaveHelper<T>(
  options: TemporarySaveHelperOptions<T>
): TemporarySaveHelper<T> {
  const {
    scope,
    storage,
    version = DEFAULT_VERSION,
    onSave,
    onLoad,
    onClear,
    onError,
  } = options;

  const getKey = () => buildTemporarySaveKey(scope);

  const save = (data: T): boolean => {
    try {
      const saved = saveTemporaryDraft(scope, data, storage, version);

      if (saved) {
        const payload = loadTemporaryDraft<T>(scope, storage);
        if (payload) {
          onSave?.(payload);
        }
      } else {
        onError?.(new Error("임시 저장에 실패했습니다"));
      }

      return saved;
    } catch (error) {
      const failure =
        error instanceof Error ? error : new Error("임시 저장에 실패했습니다");
      onError?.(failure);
      return false;
    }
  };

  const load = (): TemporarySavePayload<T> | null => {
    try {
      const payload = loadTemporaryDraft<T>(scope, storage);
      onLoad?.(payload);
      return payload;
    } catch (error) {
      const failure =
        error instanceof Error ? error : new Error("임시 저장 불러오기에 실패했습니다");
      onError?.(failure);
      return null;
    }
  };

  const clear = (): boolean => {
    try {
      const cleared = clearTemporaryDraft(scope, storage);

      if (cleared) {
        onClear?.();
      } else {
        onError?.(new Error("임시 저장 삭제에 실패했습니다"));
      }

      return cleared;
    } catch (error) {
      const failure =
        error instanceof Error ? error : new Error("임시 저장 삭제에 실패했습니다");
      onError?.(failure);
      return false;
    }
  };

  const hasDraft = (): boolean => hasTemporaryDraft(scope, storage);

  return {
    getKey,
    save,
    load,
    clear,
    hasDraft,
  };
}
