import { createFileRoute } from '@tanstack/react-router';
import { ResourcePage } from './-utils/index-routing/layout';

export const Route = createFileRoute('/_desktop/containers/')({
  component: function Page() {
    return <ResourcePage />;
  },
  pendingComponent: function Loading() {
    return <ResourcePage.Loading />;
  },
  errorComponent: function Error() {
    return <ResourcePage.Error />;
  },
  notFoundComponent: function NotFound() {
    return <ResourcePage.NotFound />;
  },
});
