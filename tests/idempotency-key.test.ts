import { describe, expect, it } from "vitest";
import { clearIdempotencyKey, getOrCreateIdempotencyKey, MATCH_CREATE_IDEMPOTENCY_STORAGE_KEY } from "@/lib/utils/idempotency-key";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
}

describe("match create idempotency key persistence", () => {
  it("reuses the key after reload and clears it only after matching success", () => {
    const storage = memoryStorage();
    const first = "b2cd2310-44b0-4f24-babd-3ba6ce7118ef";
    expect(getOrCreateIdempotencyKey(storage, () => first)).toBe(first);
    expect(getOrCreateIdempotencyKey(storage, () => "unused-key")).toBe(first);
    clearIdempotencyKey(storage, "another-submission");
    expect(storage.getItem(MATCH_CREATE_IDEMPOTENCY_STORAGE_KEY)).toBe(first);
    clearIdempotencyKey(storage, first);
    expect(storage.getItem(MATCH_CREATE_IDEMPOTENCY_STORAGE_KEY)).toBeNull();
  });

  it("replaces malformed stored keys", () => {
    const storage = memoryStorage();
    storage.setItem(MATCH_CREATE_IDEMPOTENCY_STORAGE_KEY, "invalid");
    const valid = "b2cd2310-44b0-4f24-babd-3ba6ce7118ef";
    expect(getOrCreateIdempotencyKey(storage, () => valid)).toBe(valid);
  });
});
