import { protocol } from 'electron';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { Effect, Result } from 'effect';
import type { createWorkspaceStore } from './store';

const imageTypes = new Map([
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.gif', 'image/gif'],
  ['.webp', 'image/webp'],
  ['.bmp', 'image/bmp'],
]);

export function registerFilePreviews(store: ReturnType<typeof createWorkspaceStore>) {
  protocol.handle('desk-file', async (request) => {
    const id = new URL(request.url).pathname.split('/').filter(Boolean).at(-1) ?? '';
    const found = await Effect.runPromise(store.fileForItem(id).pipe(Effect.result));
    const type = Result.isSuccess(found) ? imageTypes.get(extname(found.success.item.name).toLowerCase()) : undefined;

    if (Result.isFailure(found) || !found.success.path || !type) {
      return new Response(null, { status: 404 });
    }

    try {
      const bytes = await readFile(found.success.path);

      return new Response(new Uint8Array(bytes), {
        headers: { 'content-type': type, 'cache-control': 'private, max-age=3600' },
      });
    } catch {
      return new Response(null, { status: 404 });
    }
  });
}
