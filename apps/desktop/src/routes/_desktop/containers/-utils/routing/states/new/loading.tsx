import { createRenderState } from '../../../../../-utils/layout/base';
import { CreateContainerPage } from '../../../../-pages-config';

export const newLoadingState = createRenderState({
  state: 'NewLoading',
  render: function NewLoadingState() {
    return <CreateContainerPage.Loading />;
  },
});
