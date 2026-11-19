import { createRenderState } from '../../../../../-utils/layout/base';
import { ContainerPage } from '../../../../-pages-config';

export const detailLoadingState = createRenderState({
  state: 'DetailLoading',
  render: function DetailLoadingState() {
    return <ContainerPage.Loading />;
  },
});
