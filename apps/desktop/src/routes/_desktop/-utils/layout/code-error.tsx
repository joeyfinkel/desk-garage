import { PageFrame } from '@desk-garage/ui/page-frame';
import { PageContent } from '@desk-garage/ui/page-content';
import { Button } from '@desk-garage/ui/button';
import { defineLazyDefaults } from './base';

export const ResourceCodeError = defineLazyDefaults.createRenderState({
  state: 'Error',
  render: function ResourceCodeError({ retry }) {
    return (
      <PageFrame role="alert">
        <PageContent>
          <p>This page couldn't finish loading. Your saved files are still on this device.</p>
          <Button onClick={retry}>Try again</Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </PageContent>
      </PageFrame>
    );
  },
});
