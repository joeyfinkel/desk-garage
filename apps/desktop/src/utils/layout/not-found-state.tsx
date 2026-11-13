import { FolderSearch } from 'lucide-react';
import { createProp } from '@jfdevelops/react-layout';
import {
  ScreenMessage,
  ScreenMessageActions,
  ScreenMessageDescription,
  ScreenMessageIcon,
  ScreenMessageTitle,
} from '../../components/screen-message';
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
          <ScreenMessage>
            <ScreenMessageIcon>
              <FolderSearch className="size-9" />
            </ScreenMessageIcon>
            <ScreenMessageTitle>Container not found</ScreenMessageTitle>
            <ScreenMessageDescription>It isn't on this device, or it is in the trash.</ScreenMessageDescription>
            {actions ? <ScreenMessageActions>{actions}</ScreenMessageActions> : null}
          </ScreenMessage>
        </composables.Content>
      </composables.Layout>
    );
  },
});
