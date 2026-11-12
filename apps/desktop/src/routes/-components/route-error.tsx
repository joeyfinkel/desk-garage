import { Link } from '@tanstack/react-router';
import { Button } from '@desk-garage/ui/button';
import { PageFrame } from '@desk-garage/ui/page-frame';
import { PageHeader } from '@desk-garage/ui/page-header';

export function RouteError() {
  return (
    <PageFrame>
      <PageHeader title="This page could not be opened" description="Your saved containers have not been changed." />
      <Button asChild className="self-start">
        <Link to="/containers">Back to containers</Link>
      </Button>
    </PageFrame>
  );
}
