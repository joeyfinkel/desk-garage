import { createRenderState } from '../../../../../-utils/layout/base';
import { RouteError } from '../../../../../../-components/route-error';

export const newErrorState = createRenderState({
  state: 'NewError',
  render: function NewErrorState() {
    return <RouteError />;
  },
});
