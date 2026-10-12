import { useEffect } from 'react';

import { db } from '@/db/db';

const LOCAL_STORAGE_VERSION_KEY = 'appVersion';

// Clears localStorage and IndexedDB when the app version changes,
// to prevent stale data from breaking the application
export default function useVersionCheck(resetStore: () => void) {
  useEffect(() => {
    const storedVersion = localStorage.getItem(LOCAL_STORAGE_VERSION_KEY);
    const currentVersion = process.env.version;

    if (storedVersion !== currentVersion) {
      resetStore();
      db.delete().then(() => db.open());
      localStorage.setItem(LOCAL_STORAGE_VERSION_KEY, currentVersion ?? '');
    }
  }, [resetStore]);
}
