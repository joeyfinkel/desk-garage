import { afterEach, describe, expect, it } from 'vite-plus/test';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Effect, Result } from 'effect';
import { createWorkspaceStore } from '../electron/workspace/store';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function setup() {
  const root = await mkdtemp(join(tmpdir(), 'desk-garage-test-'));
  roots.push(root);
  const store = createWorkspaceStore(join(root, 'garage'));
  await Effect.runPromise(store.execute({ type: 'load' }));

  return { root, store };
}

describe('native file storage', () => {
  it('edits and clears optional descriptions while preserving legacy containers and files', async () => {
    const { root, store } = await setup();
    const source = join(root, 'keep.txt');
    await writeFile(source, 'keep');
    const imported = await Effect.runPromise(store.execute({ type: 'importFiles', containerId: 'everyday', paths: [source] }));
    const updated = await Effect.runPromise(
      store.execute({ type: 'updateContainer', id: 'everyday', name: '  Essentials  ', description: '  Daily files  ' }),
    );
    expect(updated.containers[0]).toMatchObject({ name: 'Essentials', description: 'Daily files' });
    expect(updated.items).toEqual(imported.items);
    const restarted = createWorkspaceStore(join(root, 'garage'));
    expect((await Effect.runPromise(restarted.execute({ type: 'load' }))).containers[0]?.description).toBe('Daily files');
    const cleared = await Effect.runPromise(
      restarted.execute({ type: 'updateContainer', id: 'everyday', name: 'Essentials', description: '   ' }),
    );
    expect(cleared.containers[0]?.description).toBeUndefined();
    const invalid = await Effect.runPromise(
      restarted.execute({ type: 'updateContainer', id: 'everyday', name: '', description: 'changed' }).pipe(Effect.result),
    );
    expect(Result.isFailure(invalid)).toBe(true);
    expect((await Effect.runPromise(restarted.execute({ type: 'load' }))).containers).toEqual(cleared.containers);
    await Effect.runPromise(restarted.execute({ type: 'trashContainer', id: 'everyday' }));
    const trashed = await Effect.runPromise(
      restarted.execute({ type: 'updateContainer', id: 'everyday', name: 'Hidden' }).pipe(Effect.result),
    );
    expect(Result.isFailure(trashed)).toBe(true);
  });

  it('owns an exact independent copy and survives a store restart', async () => {
    const { root, store } = await setup();
    const original = join(root, 'headshot.png');
    const contents = Buffer.from([0, 255, 42, 7]);
    await writeFile(original, contents);
    const imported = await Effect.runPromise(store.execute({ type: 'importFiles', containerId: 'everyday', paths: [original] }));
    const item = imported.items[0];

    if (!item) {
      throw new Error('Expected imported file');
    }

    await rm(original);
    const restarted = createWorkspaceStore(join(root, 'garage'));
    const file = await Effect.runPromise(restarted.fileForItem(item.id));
    expect(await readFile(file.path)).toEqual(contents);
    expect((await Effect.runPromise(restarted.execute({ type: 'load' }))).items).toHaveLength(1);
  });

  it('preserves files with identical names as separate imports', async () => {
    const { root, store } = await setup();
    const original = join(root, 'same.txt');
    await writeFile(original, 'first');
    await Effect.runPromise(store.execute({ type: 'importFiles', containerId: 'everyday', paths: [original] }));
    await writeFile(original, 'second');
    const next = await Effect.runPromise(store.execute({ type: 'importFiles', containerId: 'everyday', paths: [original] }));
    const values = await Promise.all(
      next.items.map(async (item) => {
        const file = await Effect.runPromise(store.fileForItem(item.id));

        return readFile(file.path, 'utf8');
      }),
    );
    expect(values).toEqual(['first', 'second']);
  });

  it('rolls back a whole batch when one source is missing', async () => {
    const { root, store } = await setup();
    const original = join(root, 'exists.txt');
    await writeFile(original, 'keep');
    const result = await Effect.runPromise(
      store.execute({ type: 'importFiles', containerId: 'everyday', paths: [original, join(root, 'missing.txt')] }).pipe(Effect.result),
    );
    expect(Result.isFailure(result)).toBe(true);
    expect((await Effect.runPromise(store.execute({ type: 'load' }))).items).toHaveLength(0);
    expect(await readdir(join(root, 'garage/files'))).toEqual([]);
    expect(await readFile(original, 'utf8')).toBe('keep');
  });

  it('keeps container deletion and individual item deletion independently recoverable', async () => {
    const { root, store } = await setup();
    const original = join(root, 'note.txt');
    await writeFile(original, 'kept');
    const imported = await Effect.runPromise(store.execute({ type: 'importFiles', containerId: 'everyday', paths: [original] }));
    const id = imported.items[0]?.id;

    if (!id) {
      throw new Error('Expected imported file');
    }

    await Effect.runPromise(store.execute({ type: 'trashItem', id }));
    await Effect.runPromise(store.execute({ type: 'trashContainer', id: 'everyday' }));
    const blocked = await Effect.runPromise(store.execute({ type: 'restoreItem', id }).pipe(Effect.result));
    expect(Result.isFailure(blocked)).toBe(true);
    await Effect.runPromise(store.execute({ type: 'restoreContainer', id: 'everyday' }));
    expect((await Effect.runPromise(store.execute({ type: 'load' }))).items[0]?.deletedAt).not.toBeNull();
    await Effect.runPromise(store.execute({ type: 'restoreItem', id }));
    const file = await Effect.runPromise(store.fileForItem(id));
    expect(await readFile(file.path, 'utf8')).toBe('kept');
  });

  it('migrates legacy containers once and serializes concurrent changes', async () => {
    const root = await mkdtemp(join(tmpdir(), 'desk-garage-test-'));
    roots.push(root);
    const store = createWorkspaceStore(join(root, 'garage'));
    const legacy = [{ id: 'legacy', name: 'My files', deletedAt: null }];
    await Effect.runPromise(store.execute({ type: 'load', legacyContainers: JSON.stringify(legacy) }));
    await Promise.all(['One', 'Two', 'Three'].map((name) => Effect.runPromise(store.execute({ type: 'createContainer', name }))));
    const next = await Effect.runPromise(store.execute({ type: 'load', legacyContainers: '[]' }));
    expect(next.containers.map((container) => container.name)).toEqual(['My files', 'One', 'Two', 'Three']);
  });

  it('preserves corrupt metadata instead of replacing it', async () => {
    const { root, store } = await setup();
    const metadata = join(root, 'garage/workspace.json');
    await writeFile(metadata, '{broken');
    const result = await Effect.runPromise(store.execute({ type: 'createContainer', name: 'New' }).pipe(Effect.result));
    expect(Result.isFailure(result)).toBe(true);
    expect(await readFile(metadata, 'utf8')).toBe('{broken');
  });

  it('rejects directories and inactive containers', async () => {
    const { root, store } = await setup();
    const folder = join(root, 'folder');
    await mkdir(folder);
    expect(
      Result.isFailure(
        await Effect.runPromise(store.execute({ type: 'importFiles', containerId: 'everyday', paths: [folder] }).pipe(Effect.result)),
      ),
    ).toBe(true);
    await Effect.runPromise(store.execute({ type: 'trashContainer', id: 'everyday' }));
    expect(
      Result.isFailure(
        await Effect.runPromise(store.execute({ type: 'importFiles', containerId: 'everyday', paths: [folder] }).pipe(Effect.result)),
      ),
    ).toBe(true);
  });
});
