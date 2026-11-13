import { Effect, Schema } from 'effect';
import { type WorkspaceCommand, WorkspaceError, WorkspaceResponse } from '@desk-garage/workspace';

export function decodeWorkspaceResponse(response: unknown) {
  return Schema.decodeUnknownEffect(WorkspaceResponse)(response).pipe(
    Effect.mapError((cause) => new WorkspaceError({ message: 'The desktop returned an invalid response.', cause })),
    Effect.flatMap((response) =>
      response.ok ? Effect.succeed(response.value) : Effect.fail(new WorkspaceError({ message: response.error })),
    ),
  );
}

export function runWorkspaceCommand(command: WorkspaceCommand) {
  return Effect.tryPromise({
    try: async () => {
      if (!window.deskGarage) {
        throw new Error('The native desktop connection is unavailable.');
      }

      return window.deskGarage.command(command);
    },
    catch: (cause) => new WorkspaceError({ message: 'The desktop connection is unavailable. Restart DeskGarage and try again.', cause }),
  }).pipe(Effect.flatMap(decodeWorkspaceResponse));
}
