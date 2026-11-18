import { createRenderState } from '../../../../../-utils/layout/base';
import { ContainerDetail } from '../../../../$containerId/-components/content';

export const detailState = createRenderState({
  state: 'Detail',
  render: function DefaultState() {
    return <ContainerDetail />;
  },
});
