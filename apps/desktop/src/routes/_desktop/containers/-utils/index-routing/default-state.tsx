import { createRenderState } from '../../../../../utils/layout/base';
import { ContainersIndex } from '../../-components/index-content';

export const defaultState = createRenderState({
  state: 'default',
  render: function DefaultState() {
    return <ContainersIndex />;
  },
});
