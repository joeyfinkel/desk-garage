import { reactNode } from '@jfdevelops/react-layout-adapter-effect';
import { Schema } from 'effect';

export function optionalReactNode() {
  return Schema.toStandardSchemaV1(Schema.UndefinedOr(reactNode()));
}
