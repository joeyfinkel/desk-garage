import { createProp } from '@jfdevelops/react-layout';
import { createRenderState } from './base';

export const errorState = createRenderState({
  state: 'Error',
  props: {
    custom: {
      message: createProp.component({ type: 'ReactNode' }).optional(),
      actions: createProp.component({ type: 'ReactNode' }).optional(),
    },
  },
  render: function ResourceError({ message, actions }, { composables }) {
    return (
      <composables.Layout role="alert">
        <composables.Header
          title="Unable to load your garage"
          description={message ?? 'Your saved data has not been changed. Try again.'}
        />
        <composables.Content>
          <div className="flex flex-wrap gap-2">{actions}</div>
        </composables.Content>
      </composables.Layout>
    );
  },
});
