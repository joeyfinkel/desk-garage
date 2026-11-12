import { createRenderState } from '../../../../../../utils/layout/base';
import { ContainerDetail } from '../../-components/content';

export const defaultState = createRenderState({
  state: 'default',
  render: function DefaultState() {
    return <ContainerDetail />;
  },
});
