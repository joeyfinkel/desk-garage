import { Data, Schema } from 'effect';
import { Containers } from '@desk-garage/containers';

export const FileItem = Schema.Struct({
  id: Schema.String,
  containerId: Schema.String,
  name: Schema.String,
  size: Schema.Number,
  createdAt: Schema.String,
  deletedAt: Schema.NullOr(Schema.String),
});
export type FileItem = typeof FileItem.Type;
export const Workspace = Schema.Struct({
  version: Schema.Literal(1),
  revision: Schema.Number,
  containers: Containers,
  items: Schema.Array(FileItem),
});
export type Workspace = typeof Workspace.Type;

export const WorkspaceCommand = Schema.Union([
  Schema.Struct({ type: Schema.Literal('load'), legacyContainers: Schema.optional(Schema.NullOr(Schema.String)) }),
  Schema.Struct({ type: Schema.Literal('createContainer'), name: Schema.String, description: Schema.optional(Schema.String) }),
  Schema.Struct({
    type: Schema.Literal('updateContainer'),
    id: Schema.String,
    name: Schema.String,
    description: Schema.optional(Schema.String),
  }),
  Schema.Struct({
    type: Schema.Literals(['trashContainer', 'restoreContainer', 'trashItem', 'restoreItem', 'exportItem']),
    id: Schema.String,
  }),
  Schema.Struct({ type: Schema.Literal('importFiles'), containerId: Schema.String, paths: Schema.Array(Schema.String) }),
  Schema.Struct({ type: Schema.Literal('pickFiles'), containerId: Schema.String }),
]);
export type WorkspaceCommand = typeof WorkspaceCommand.Type;

export const WorkspaceResponse = Schema.Union([
  Schema.Struct({ ok: Schema.Literal(true), value: Workspace }),
  Schema.Struct({ ok: Schema.Literal(false), error: Schema.String }),
]);
export type WorkspaceResponse = typeof WorkspaceResponse.Type;

export class WorkspaceError extends Data.TaggedError('WorkspaceError')<{ readonly message: string; readonly cause?: unknown }> {}
