import { useCallback, useEffect, useState } from 'react';
import { storage, StorageKeys } from '../services/storage';

const MAX_RECENT = 8;

/** Persisted recent-search list, most recent first, de-duplicated case-insensitively. */
export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await storage.get<string[]>(StorageKeys.recentSearches);
      if (!cancelled && Array.isArray(saved)) setRecent(saved);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const addRecent = useCallback((term: string) => {
    const value = term.trim();
    if (value.length < 2) return;

    setRecent((prev) => {
      const next = [value, ...prev.filter((t) => t.toLowerCase() !== value.toLowerCase())].slice(
        0,
        MAX_RECENT,
      );
      void storage.set(StorageKeys.recentSearches, next);
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
    void storage.set(StorageKeys.recentSearches, []);
  }, []);

  return { recent, addRecent, clearRecent };
}
