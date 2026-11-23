// Tiny in-memory cache whose entries expire after `ttlMs`. Good for data that is read on every
// request but rarely changes. Per server process, so it resets on restart.
export const createTtlCache = (ttlMs) => {
  const entries = new Map();

  return {
    get(key) {
      const entry = entries.get(key);
      if (!entry) return undefined;

      if (entry.expiresAt < Date.now()) {
        entries.delete(key);
        return undefined;
      }
      return entry.value;
    },

    set(key, value) {
      entries.set(key, { value, expiresAt: Date.now() + ttlMs });
    },
  };
};
