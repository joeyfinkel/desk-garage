import { createRenderState } from '../../../../../-utils/layout/base';
import { NotFound } from '../../../../../../-components/not-found';

export const detailNotFoundState = createRenderState({
  state: 'DetailNotFound',
  render: function DetailNotFoundState() {
    return <NotFound />;
  },
});
