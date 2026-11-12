import { Skeleton } from '@desk-garage/ui/skeleton';
import { createRenderState } from './base';

export const loadingState = createRenderState({
  state: 'Loading',
  render: function ResourceLoading(_, { composables }) {
    return (
      <composables.Layout role="status" aria-label="Loading workspace" aria-busy="true">
        <span className="sr-only">Loading your garage…</span>
        <composables.Content>
          <Skeleton className="mb-5 h-4 w-24" />
          <Skeleton className="mb-3 h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </composables.Content>
      </composables.Layout>
    );
  },
});
