import { createRenderState } from '../../utils/layout/base';
import { RouteError } from '../-components/route-error';

export const errorState = createRenderState({
  state: 'Error',
  render: function ErrorState() {
    return <RouteError />;
  },
});
