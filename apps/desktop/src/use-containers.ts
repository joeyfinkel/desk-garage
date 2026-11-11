import { useEffect, useState } from 'react';

interface Container {
  id: string;
  name: string;
  deletedAt: string | null;
}

const storageKey = 'desk-garage:containers:v1';

function readContainers(): Container[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? 'null');

    if (
      Array.isArray(value) &&
      value.every(
        (item) =>
          typeof item === 'object' &&
          item !== null &&
          typeof item.id === 'string' &&
          typeof item.name === 'string' &&
          (item.deletedAt === null || typeof item.deletedAt === 'string'),
      )
    ) {
      return value;
    }
  } catch {
    // Fall back to the initial container if local storage is unavailable or malformed.
  }

  return [{ id: 'everyday', name: 'Everyday', deletedAt: null }];
}

export function useContainers() {
  const [containers, setContainers] = useState(readContainers);
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(containers));
      setStorageError('');
    } catch {
      setStorageError('Your changes could not be saved on this device.');
    }
  }, [containers]);

  function addContainer(name: string) {
    const id = crypto.randomUUID();
    setContainers((current) => [...current, { id, name: name.trim(), deletedAt: null }]);

    return id;
  }

  function trashContainer(id: string) {
    setContainers((current) =>
      current.map((container) => (container.id === id ? { ...container, deletedAt: new Date().toISOString() } : container)),
    );
  }

  function restoreContainer(id: string) {
    setContainers((current) => current.map((container) => (container.id === id ? { ...container, deletedAt: null } : container)));
  }

  return { containers, addContainer, trashContainer, restoreContainer, storageError };
}
