import { Link } from '@tanstack/react-router';
import { Button } from '@desk-garage/ui/button';
import { PageFrame } from '@desk-garage/ui/page-frame';
import { PageHeader } from '@desk-garage/ui/page-header';

export function NotFound() {
  return (
    <PageFrame>
      <PageHeader title="Page not found" description="This location is not available in DeskGarage." />
      <Button asChild className="self-start">
        <Link to="/containers">Back to containers</Link>
      </Button>
    </PageFrame>
  );
}
