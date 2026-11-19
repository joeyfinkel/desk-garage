import { defineResourceLayout } from '../../../-utils/layout/base';
import { createResourceConfig } from '../../../-utils/layout/layout';

const Page = defineResourceLayout.lazy({ resource: 'containers', load: () => import('./layout') });

export const containersConfig = createResourceConfig.forResource('containers', {
  component: <Page />,
  pendingComponent: <Page.Loading />,
  errorComponent: <Page.Error />,
  notFoundComponent: <Page.NotFound />,
  detail: {
    component: <Page.Detail />,
    pendingComponent: <Page.DetailLoading />,
    errorComponent: <Page.DetailError />,
    notFoundComponent: <Page.DetailNotFound />,
  },
  new: {
    component: <Page.New />,
    pendingComponent: <Page.NewLoading />,
    errorComponent: <Page.NewError />,
    notFoundComponent: <Page.NewNotFound />,
  },
});
