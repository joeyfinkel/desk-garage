import { Context, Data, type Effect } from 'effect';

export class ContainerError extends Data.TaggedError('ContainerError')<{
  readonly operation: 'read' | 'write' | 'validate' | 'create' | 'trash' | 'restore';
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class ContainerStorage extends Context.Service<
  ContainerStorage,
  {
    readonly read: Effect.Effect<string | null, ContainerError>;
    readonly write: (value: string) => Effect.Effect<void, ContainerError>;
    readonly createId: Effect.Effect<string, ContainerError>;
  }
>()('@desk-garage/containers/ContainerStorage') {}
