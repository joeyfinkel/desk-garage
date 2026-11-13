import { Link } from '@tanstack/react-router';
import { SearchX } from 'lucide-react';
import { Button } from '@desk-garage/ui/button';
import { PageFrame } from '@desk-garage/ui/page-frame';
import {
  ScreenMessage,
  ScreenMessageActions,
  ScreenMessageDescription,
  ScreenMessageIcon,
  ScreenMessageTitle,
} from '../../components/screen-message';

export function NotFound() {
  return (
    <PageFrame className="min-h-full">
      <ScreenMessage>
        <ScreenMessageIcon>
          <SearchX className="size-9" />
        </ScreenMessageIcon>
        <ScreenMessageTitle>Page not found</ScreenMessageTitle>
        <ScreenMessageDescription>This location isn't part of Desk Garage.</ScreenMessageDescription>
        <ScreenMessageActions>
          <Button asChild>
            <Link to="/containers">Back to containers</Link>
          </Button>
        </ScreenMessageActions>
      </ScreenMessage>
    </PageFrame>
  );
}
