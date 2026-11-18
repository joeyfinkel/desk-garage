import { PageFrame } from '@desk-garage/ui/page-frame';
import { PageContent } from '@desk-garage/ui/page-content';
import { Skeleton } from '@desk-garage/ui/skeleton';

export function ResourceCodeLoading() {
  return (
    <PageFrame role="status" aria-busy="true" aria-label="Loading page">
      <span className="sr-only">Loading page…</span>
      <PageContent>
        <Skeleton className="h-14 w-full" />
      </PageContent>
    </PageFrame>
  );
}
