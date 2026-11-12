import { CircleAlert } from 'lucide-react';
import { createProp } from '@jfdevelops/react-layout';
import { ScreenMessage, ScreenMessageActions, ScreenMessageDescription, ScreenMessageIcon, ScreenMessageTitle } from '../../components/screen-message';
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
      <composables.Layout role="alert" className="min-h-full">
        <composables.Content>
          <ScreenMessage>
            <ScreenMessageIcon>
              <CircleAlert className="size-9" />
            </ScreenMessageIcon>
            <ScreenMessageTitle>Your garage didn't open</ScreenMessageTitle>
            <ScreenMessageDescription>
              {typeof message === 'string' && message ? message : 'Saved files are still on this device. Try again.'}
            </ScreenMessageDescription>
            {actions ? <ScreenMessageActions>{actions}</ScreenMessageActions> : null}
          </ScreenMessage>
        </composables.Content>
      </composables.Layout>
    );
  },
});
