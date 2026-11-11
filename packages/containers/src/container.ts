import { Schema } from 'effect';

export const Container = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  deletedAt: Schema.NullOr(Schema.String),
});

export type Container = typeof Container.Type;
export const Containers = Schema.Array(Container);
export const ContainersJson = Schema.fromJsonString(Containers);
export const initialContainers: ReadonlyArray<Container> = [{ id: 'everyday', name: 'Everyday', deletedAt: null }];
