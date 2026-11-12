import type { ErrorComponentProps } from '@tanstack/react-router';
import { Link, useRouter } from '@tanstack/react-router';
import { CircleAlert } from 'lucide-react';
import { Button } from '@desk-garage/ui/button';
import { PageFrame } from '@desk-garage/ui/page-frame';
import { ScreenMessage, ScreenMessageActions, ScreenMessageDescription, ScreenMessageIcon, ScreenMessageTitle } from '../../components/screen-message';

export function RouteError({ reset }: Partial<ErrorComponentProps> = {}) {
  const router = useRouter();

  return (
    <PageFrame className="min-h-full">
      <ScreenMessage>
        <ScreenMessageIcon>
          <CircleAlert className="size-9" />
        </ScreenMessageIcon>
        <ScreenMessageTitle>This page didn't open</ScreenMessageTitle>
        <ScreenMessageDescription>Your saved containers were not changed.</ScreenMessageDescription>
        <ScreenMessageActions>
          <Button
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
          <Button asChild variant="outline">
            <Link to="/containers">Back to containers</Link>
          </Button>
        </ScreenMessageActions>
      </ScreenMessage>
    </PageFrame>
  );
}
