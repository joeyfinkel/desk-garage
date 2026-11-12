import { randomUUID } from 'node:crypto';
import { copyFile, lstat, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { basename, isAbsolute, join } from 'node:path';
import { Effect, Schema, Semaphore } from 'effect';
import { ContainerError, ContainerStorage, Containers, initialContainers, restoreContainer, trashContainer } from '@desk-garage/containers';
import { type FileItem, Workspace, type WorkspaceCommand, WorkspaceError } from '@desk-garage/workspace';

export function createWorkspaceStore(root: string) {
  const gate = Semaphore.makeUnsafe(1);
  const metadataPath = join(root, 'workspace.json');

  function io<A>(operation: () => Promise<A>, message: string) {
    return Effect.tryPromise({ try: operation, catch: (cause) => new WorkspaceError({ message, cause }) });
  }

  function read(legacyContainers?: string | null) {
    return Effect.gen(function* () {
      const raw = yield* Effect.tryPromise({
        try: () => readFile(metadataPath, 'utf8'),
        catch: (cause) => cause,
      }).pipe(
        Effect.catch((cause) => {
          if (cause instanceof Error && 'code' in cause && cause.code === 'ENOENT') {
            return Effect.succeed(null);
          }

          return Effect.fail(new WorkspaceError({ message: 'Your workspace could not be read. Saved data has been preserved.', cause }));
        }),
      );

      if (raw !== null) {
        return yield* Schema.decodeUnknownEffect(Schema.fromJsonString(Workspace))(raw).pipe(
          Effect.mapError(
            (cause) => new WorkspaceError({ message: 'Saved workspace metadata is invalid. It has not been overwritten.', cause }),
          ),
        );
      }

      const containers =
        legacyContainers == null
          ? initialContainers
          : yield* Schema.decodeUnknownEffect(Schema.fromJsonString(Containers))(legacyContainers).pipe(
              Effect.mapError(
                (cause) =>
                  new WorkspaceError({ message: 'Existing containers could not be migrated. Their original data is preserved.', cause }),
              ),
            );
      const workspace: Workspace = { version: 1, revision: 0, containers, items: [] };
      yield* save(workspace);

      return workspace;
    });
  }

  function save(workspace: Workspace) {
    return io(async () => {
      await mkdir(root, { recursive: true });
      const temporary = join(root, `workspace-${randomUUID()}.tmp`);

      try {
        await writeFile(temporary, JSON.stringify(workspace), { encoding: 'utf8', mode: 0o600 });
        await rename(temporary, metadataPath);
      } finally {
        await rm(temporary, { force: true });
      }
    }, 'Changes could not be saved. Please check available disk space and try again.');
  }

  function pathFor(item: FileItem) {
    return join(root, 'files', item.id, item.name);
  }

  function importFiles(workspace: Workspace, containerId: string, paths: readonly string[]) {
    return Effect.gen(function* () {
      if (!workspace.containers.some((container) => container.id === containerId && !container.deletedAt)) {
        return yield* new WorkspaceError({ message: 'Choose an active container before importing files.' });
      }

      if (!paths.length || paths.length > 100) {
        return yield* new WorkspaceError({ message: 'Choose between 1 and 100 files at a time.' });
      }

      const staged: FileItem[] = [];
      const next = yield* io(async () => {
        try {
          for (const source of paths) {
            if (!isAbsolute(source)) {
              throw new Error('A dropped file does not have a native path.');
            }

            const info = await lstat(source);

            if (!info.isFile()) {
              throw new Error('Only regular files can be imported. Folders and shortcuts are not supported yet.');
            }

            const item: FileItem = {
              id: randomUUID(),
              containerId,
              name: basename(source),
              size: info.size,
              createdAt: new Date().toISOString(),
              deletedAt: null,
            };
            staged.push(item);
            await mkdir(join(root, 'files', item.id), { recursive: true });
            await copyFile(source, pathFor(item));
          }

          return { ...workspace, revision: workspace.revision + 1, items: [...workspace.items, ...staged] };
        } catch (cause) {
          await Promise.all(staged.map((item) => rm(join(root, 'files', item.id), { recursive: true, force: true })));
          throw cause;
        }
      }, 'Import failed. Choose regular files that are still available on this device. No items from this batch were added.');
      yield* save(next).pipe(
        Effect.tapError(() =>
          io(
            () => Promise.all(staged.map((item) => rm(join(root, 'files', item.id), { recursive: true, force: true }))),
            'Temporary imported files could not be cleaned up.',
          ),
        ),
      );

      return next;
    });
  }

  function execute(command: WorkspaceCommand) {
    return gate.withPermit(
      Effect.gen(function* () {
        const workspace = yield* read(command.type === 'load' ? command.legacyContainers : undefined);

        if (command.type === 'load') {
          return workspace;
        }

        if (command.type === 'importFiles') {
          return yield* importFiles(workspace, command.containerId, command.paths);
        }

        if (command.type === 'pickFiles' || command.type === 'exportItem') {
          return yield* new WorkspaceError({ message: 'This action requires the native file dialog.' });
        }

        if (command.type === 'updateContainer' || command.type === 'createContainer') {
          const name = command.name.trim();
          const description = command.description?.trim() || undefined;

          if (!name || name.length > 80 || (description?.length ?? 0) > 1000) {
            return yield* new WorkspaceError({
              message: 'Use a name between 1 and 80 characters and a description up to 1,000 characters.',
            });
          }

          if (
            command.type === 'updateContainer' &&
            !workspace.containers.some((container) => container.id === command.id && !container.deletedAt)
          ) {
            return yield* new WorkspaceError({ message: 'This container is unavailable or in the trash.' });
          }

          const containers =
            command.type === 'createContainer'
              ? [...workspace.containers, { id: randomUUID(), name, description, deletedAt: null }]
              : workspace.containers.map((container) => (container.id === command.id ? { ...container, name, description } : container));
          const next = { ...workspace, containers, revision: workspace.revision + 1 };
          yield* save(next);

          return next;
        }

        let next: Workspace = workspace;

        if (command.type === 'trashContainer' || command.type === 'restoreContainer') {
          const storage = ContainerStorage.of({
            read: Effect.succeed(JSON.stringify(workspace.containers)),
            createId: Effect.sync(randomUUID),
            write: (value) =>
              Schema.decodeUnknownEffect(Schema.fromJsonString(Containers))(value).pipe(
                Effect.mapError((cause) => new ContainerError({ operation: 'write', message: 'Container metadata is invalid.', cause })),
                Effect.andThen((containers) =>
                  Effect.sync(() => {
                    next = { ...workspace, containers };
                  }),
                ),
              ),
          });
          const operation =
            command.type === 'trashContainer' ? trashContainer(command.id) : restoreContainer(command.id).pipe(Effect.asVoid);
          yield* operation.pipe(
            Effect.provideService(ContainerStorage, storage),
            Effect.mapError((cause) => new WorkspaceError({ message: cause.message, cause })),
          );
        } else {
          const item = workspace.items.find((item) => item.id === command.id);

          if (!item) {
            return yield* new WorkspaceError({ message: 'This file no longer exists.' });
          }

          if (
            command.type === 'restoreItem' &&
            !workspace.containers.some((container) => container.id === item.containerId && !container.deletedAt)
          ) {
            return yield* new WorkspaceError({ message: 'Restore the original container before restoring this file.' });
          }

          next = {
            ...workspace,
            items: workspace.items.map((item) =>
              item.id === command.id ? { ...item, deletedAt: command.type === 'trashItem' ? new Date().toISOString() : null } : item,
            ),
          };
        }

        next = { ...next, revision: workspace.revision + 1 };
        yield* save(next);

        return next;
      }),
    );
  }

  function fileForItem(id: string) {
    return gate.withPermit(
      Effect.gen(function* () {
        const workspace = yield* read();
        const item = workspace.items.find(
          (item) =>
            item.id === id &&
            !item.deletedAt &&
            workspace.containers.some((container) => container.id === item.containerId && !container.deletedAt),
        );

        if (!item) {
          return yield* new WorkspaceError({ message: 'Restore this file and its container before exporting it.' });
        }

        // Use only metadata written by the store, and reject unsafe metadata if the file was edited externally.
        if (['.', '..'].includes(item.name) || basename(item.name) !== item.name || !/^[a-f0-9-]{36}$/.test(item.id)) {
          return yield* new WorkspaceError({ message: 'The saved file location is invalid.' });
        }

        return { item, path: pathFor(item) };
      }),
    );
  }

  return { execute, fileForItem };
}
