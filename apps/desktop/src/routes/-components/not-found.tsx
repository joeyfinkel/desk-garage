import { Link } from '@tanstack/react-router';
import { SearchX } from 'lucide-react';
import { Button } from '@desk-garage/ui/button';
import { PageFrame } from '@desk-garage/ui/page-frame';
import { ScreenMessage } from '../../components/screen-message';

export function NotFound() {
  return (
    <PageFrame className="min-h-full">
      <ScreenMessage
        icon={<SearchX className="size-9" />}
        title="Page not found"
        description="This location isn't part of Desk Garage."
        actions={
          <Button asChild>
            <Link to="/containers">Back to containers</Link>
          </Button>
        }
      />
    </PageFrame>
  );
}
