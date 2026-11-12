import { createProp } from '@jfdevelops/react-layout';
import { createRenderState } from './base';

export const notFoundState = createRenderState({
  state: 'NotFound',
  props: {
    custom: {
      actions: createProp.component({ type: 'ReactNode' }).optional(),
    },
  },
  render: function ResourceNotFound({ actions }, { composables }) {
    return (
      <composables.Layout>
        <composables.Header title="Container not found" description="This container does not exist or is in the trash." />
        <composables.Content>
          <div className="flex flex-wrap gap-2">{actions}</div>
        </composables.Content>
      </composables.Layout>
    );
  },
});
