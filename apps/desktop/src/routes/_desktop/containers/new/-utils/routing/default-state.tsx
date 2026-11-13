import { createRenderState } from '../../../../../../utils/layout/base';
import { CreateContainer } from '../../-components/content';

export const defaultState = createRenderState({
  state: 'default',
  render: function DefaultState() {
    return <CreateContainer />;
  },
});
