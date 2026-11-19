import { createRenderState } from '../../../../-utils/layout/base';
import { TrashPage } from '../../../-pages-config';

export const loadingState = createRenderState({
  state: 'Loading',
  render: function LoadingState() {
    return <TrashPage.Loading />;
  },
});
