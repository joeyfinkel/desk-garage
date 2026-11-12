import { FolderSearch } from 'lucide-react';
import { createProp } from '@jfdevelops/react-layout';
import { ScreenMessage } from '../../components/screen-message';
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
      <composables.Layout className="min-h-full">
        <composables.Content>
          <ScreenMessage
            icon={<FolderSearch className="size-9" />}
            title="Container not found"
            description="It isn't on this device, or it is in the trash."
            actions={actions}
          />
        </composables.Content>
      </composables.Layout>
    );
  },
});
