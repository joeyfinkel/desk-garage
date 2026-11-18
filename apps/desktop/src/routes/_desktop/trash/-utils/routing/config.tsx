import { defineResourceLayout } from '../../../-utils/layout/base';
import { createResourceConfig } from '../../../-utils/layout/layout';

const Page = defineResourceLayout.lazy({ resource: 'trash', load: () => import('./layout') });

export const trashConfig = createResourceConfig.forResource('trash', {
  component: <Page />,
  pendingComponent: <Page.Loading />,
  errorComponent: <Page.Error />,
  notFoundComponent: <Page.NotFound />,
});
