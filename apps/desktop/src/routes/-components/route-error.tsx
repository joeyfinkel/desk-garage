import type { ErrorComponentProps } from '@tanstack/react-router';
import { Link, useRouter } from '@tanstack/react-router';
import { Button } from '@desk-garage/ui/button';
import { PageFrame } from '@desk-garage/ui/page-frame';
import { PageHeader } from '@desk-garage/ui/page-header';

export function RouteError({ reset }: Partial<ErrorComponentProps> = {}) {
  const router = useRouter();

  return (
    <PageFrame>
      <PageHeader title="This page could not be opened" description="Your saved containers have not been changed." />
      <Button
        className="mb-3 self-start"
        onClick={() => {
          if (reset) {
            reset();
          } else {
            void router.invalidate();
          }
        }}
      >
        Try again
      </Button>
      <Button asChild className="self-start">
        <Link to="/containers">Back to containers</Link>
      </Button>
    </PageFrame>
  );
}
