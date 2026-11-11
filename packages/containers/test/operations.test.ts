import { describe, expect, it } from 'vite-plus/test';
import { Effect, Result } from 'effect';
import { addContainer, ContainerError, ContainerStorage, loadContainers, restoreContainer, trashContainer } from '../src/index';

function makeStorage(initial: string | null = null) {
  let value = initial;
  let writes = 0;
  let nextId = 0;
  const service = ContainerStorage.of({
    read: Effect.sync(() => value),
    write: (next) =>
      Effect.sync(() => {
        value = next;
        writes += 1;
      }),
    createId: Effect.sync(() => `container-${++nextId}`),
  });

  function run<A>(operation: Effect.Effect<A, ContainerError, ContainerStorage>) {
    return Effect.runSync(operation.pipe(Effect.provideService(ContainerStorage, service), Effect.result));
  }

  return { run, service, getValue: () => value, getWrites: () => writes };
}

describe('container persistence', () => {
  it('loads a fresh workspace without writing during initialization', () => {
    const storage = makeStorage();
    const result = storage.run(loadContainers);
    expect(Result.isSuccess(result)).toBe(true);
    expect(storage.getWrites()).toBe(0);
  });

  it('persists create, trash and restore across independent reads', () => {
    const storage = makeStorage();
    const created = storage.run(addContainer('  Headshots  '));

    if (Result.isFailure(created)) {
      throw created.failure;
    }

    const id = created.success.id;
    expect(created.success.containers.at(-1)?.name).toBe('Headshots');
    const trashed = storage.run(trashContainer(id));

    if (Result.isFailure(trashed)) {
      throw trashed.failure;
    }

    expect(trashed.success.find((item) => item.id === id)?.deletedAt).toEqual(expect.any(String));
    storage.run(restoreContainer(id));
    const reloaded = storage.run(loadContainers);

    if (Result.isFailure(reloaded)) {
      throw reloaded.failure;
    }

    expect(reloaded.success.find((item) => item.id === id)).toEqual({ id, name: 'Headshots', deletedAt: null });
  });

  it.each(['{broken', 'null', '[{"id":2,"name":"Lost","deletedAt":null}]'])('preserves invalid storage: %s', (value) => {
    const storage = makeStorage(value);
    const result = storage.run(addContainer('New'));
    expect(Result.isFailure(result)).toBe(true);
    expect(storage.getValue()).toBe(value);
    expect(storage.getWrites()).toBe(0);
  });

  it('propagates write failures without changing saved containers', () => {
    const storage = makeStorage('[]');
    const failing = ContainerStorage.of({
      ...storage.service,
      write: () => Effect.fail(new ContainerError({ operation: 'write', message: 'Disk full' })),
    });
    const result = Effect.runSync(addContainer('Headshots').pipe(Effect.provideService(ContainerStorage, failing), Effect.result));
    expect(Result.isFailure(result)).toBe(true);
    expect(storage.getValue()).toBe('[]');
  });

  it('does not turn an unavailable store into an empty workspace', () => {
    const storage = makeStorage();
    const failing = ContainerStorage.of({
      ...storage.service,
      read: Effect.fail(new ContainerError({ operation: 'read', message: 'Access denied' })),
    });
    const result = Effect.runSync(loadContainers.pipe(Effect.provideService(ContainerStorage, failing), Effect.result));
    expect(Result.isFailure(result)).toBe(true);
    expect(storage.getWrites()).toBe(0);
  });

  it.each(['', '   ', 'x'.repeat(81)])('rejects invalid names without writing', (name) => {
    const storage = makeStorage();
    expect(Result.isFailure(storage.run(addContainer(name)))).toBe(true);
    expect(storage.getWrites()).toBe(0);
  });

  it('reports missing containers instead of persisting a successful no-op', () => {
    const storage = makeStorage();
    expect(Result.isFailure(storage.run(trashContainer('missing')))).toBe(true);
    expect(Result.isFailure(storage.run(restoreContainer('missing')))).toBe(true);
    expect(storage.getWrites()).toBe(0);
  });

  it('preserves an intentionally empty workspace', () => {
    const storage = makeStorage('[]');
    const result = storage.run(loadContainers);
    expect(result).toEqual(Result.succeed([]));
  });
});
