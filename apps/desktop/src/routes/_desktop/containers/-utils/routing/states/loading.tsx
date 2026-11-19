import { createRenderState } from '../../../../-utils/layout/base';
import { GaragePage } from '../../../-pages-config';

export const loadingState = createRenderState({
  state: 'Loading',
  render: function LoadingState() {
    return <GaragePage.Loading />;
  },
});
