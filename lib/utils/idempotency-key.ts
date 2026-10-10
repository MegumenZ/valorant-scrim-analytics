export interface IdempotencyKeyStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const MATCH_CREATE_IDEMPOTENCY_STORAGE_KEY = "valorant-scrim-create-idempotency-key";

export function getOrCreateIdempotencyKey(
  storage: IdempotencyKeyStorage,
  createKey: () => string,
): string {
  const existing = storage.getItem(MATCH_CREATE_IDEMPOTENCY_STORAGE_KEY);
  if (existing && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(existing)) {
    return existing;
  }
  const key = createKey();
  storage.setItem(MATCH_CREATE_IDEMPOTENCY_STORAGE_KEY, key);
  return key;
}

export function clearIdempotencyKey(storage: IdempotencyKeyStorage, submittedKey: string): void {
  if (storage.getItem(MATCH_CREATE_IDEMPOTENCY_STORAGE_KEY) === submittedKey) {
    storage.removeItem(MATCH_CREATE_IDEMPOTENCY_STORAGE_KEY);
  }
}
