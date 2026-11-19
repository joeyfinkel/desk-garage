import { createRenderState } from '../../../../../-utils/layout/base';
import { CreateContainer } from '../../../../new/-components/content';

export const newState = createRenderState({
  state: 'New',
  render: function DefaultState() {
    return <CreateContainer />;
  },
});
