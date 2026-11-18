import { createRenderState } from '../../../../../-utils/layout/base';
import { RouteError } from '../../../../../../-components/route-error';

export const detailErrorState = createRenderState({
  state: 'DetailError',
  render: function DetailErrorState() {
    return <RouteError />;
  },
});
