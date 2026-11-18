import { createRenderState } from '../../../../../-utils/layout/base';
import { NotFound } from '../../../../../../-components/not-found';

export const newNotFoundState = createRenderState({
  state: 'NewNotFound',
  render: function NewNotFoundState() {
    return <NotFound />;
  },
});
