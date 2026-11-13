import { Clock, Effect, Schema } from 'effect';
import { type Container, ContainersJson, initialContainers } from './container';
import { ContainerError, ContainerStorage } from './storage';

export const loadContainers = Effect.gen(function* () {
  const storage = yield* ContainerStorage;
  const value = yield* storage.read;

  if (value === null) {
    return initialContainers;
  }

  return yield* Schema.decodeUnknownEffect(ContainersJson)(value).pipe(
    Effect.mapError(
      (cause) =>
        new ContainerError({
          operation: 'read',
          message: 'Saved containers could not be read. Your stored data has been preserved.',
          cause,
        }),
    ),
  );
});

function saveContainers(containers: ReadonlyArray<Container>) {
  return Effect.gen(function* () {
    const storage = yield* ContainerStorage;
    const value = yield* Schema.encodeEffect(ContainersJson)(containers).pipe(
      Effect.mapError(
        (cause) => new ContainerError({ operation: 'write', message: 'Containers could not be encoded for storage.', cause }),
      ),
    );
    yield* storage.write(value);

    return containers;
  });
}

export function addContainer(name: string) {
  return Effect.gen(function* () {
    const normalizedName = name.trim();

    if (!normalizedName || normalizedName.length > 80) {
      return yield* new ContainerError({ operation: 'validate', message: 'Use a container name between 1 and 80 characters.' });
    }

    const storage = yield* ContainerStorage;
    const containers = yield* loadContainers;
    const id = yield* storage.createId;
    const next = yield* saveContainers([...containers, { id, name: normalizedName, deletedAt: null }]);

    return { id, containers: next };
  });
}

function changeContainer(id: string, operation: 'trash' | 'restore') {
  return Effect.gen(function* () {
    const containers = yield* loadContainers;
    const container = containers.find((item) => item.id === id);

    if (!container) {
      return yield* new ContainerError({ operation, message: 'This container no longer exists.' });
    }

    const now = yield* Clock.currentTimeMillis;
    const deletedAt = operation === 'trash' ? new Date(now).toISOString() : null;

    return yield* saveContainers(containers.map((item) => (item.id === id ? { ...item, deletedAt } : item)));
  });
}

export function trashContainer(id: string) {
  return changeContainer(id, 'trash');
}

export function restoreContainer(id: string) {
  return changeContainer(id, 'restore');
}
