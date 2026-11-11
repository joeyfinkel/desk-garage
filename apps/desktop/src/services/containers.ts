import { Effect } from 'effect';
import { ContainerError, ContainerStorage } from '@desk-garage/containers';

const storageKey = 'desk-garage:containers:v1';
const storage = ContainerStorage.of({
  read: Effect.try({
    try: () => localStorage.getItem(storageKey),
    catch: (cause) =>
      new ContainerError({ operation: 'read', message: 'Local storage is unavailable. Your containers could not be loaded.', cause }),
  }),
  write: (value) =>
    Effect.try({
      try: () => localStorage.setItem(storageKey, value),
      catch: (cause) =>
        new ContainerError({ operation: 'write', message: 'Your changes could not be saved on this device. Please try again.', cause }),
    }),
  createId: Effect.try({
    try: () => crypto.randomUUID(),
    catch: (cause) => new ContainerError({ operation: 'create', message: 'A container ID could not be created. Please try again.', cause }),
  }),
});

// The current local-storage adapter is synchronous. Interpret effects only at this UI boundary.
export function runContainerOperation<A>(operation: Effect.Effect<A, ContainerError, ContainerStorage>) {
  return Effect.runSync(operation.pipe(Effect.provideService(ContainerStorage, storage), Effect.result));
}
