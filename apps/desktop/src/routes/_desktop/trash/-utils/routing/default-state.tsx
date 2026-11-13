import { createRenderState } from '../../../../../utils/layout/base';
import { Trash } from '../../-components/content';

export const defaultState = createRenderState({
  state: 'default',
  render: function DefaultState() {
    return <Trash />;
  },
});
