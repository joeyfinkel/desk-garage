import { createRenderState } from '../../utils/layout/base';
import { NotFound } from '../-components/not-found';

export const notFoundState = createRenderState({
  state: 'NotFound',
  render: function NotFoundState() {
    return <NotFound />;
  },
});
