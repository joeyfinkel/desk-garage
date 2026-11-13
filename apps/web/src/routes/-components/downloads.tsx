import { Button } from '@desk-garage/ui/button';
import type { Downloads } from '../../downloads';

export function DownloadLinks({ downloads }: { downloads: Downloads }) {
  const links = downloads.mac.length > 0 ? downloads.mac : [{ label: 'See downloads', href: downloads.releaseUrl }];

  return (
    <div id="download" className="flex max-w-xl flex-col items-start gap-3">
      <div className="flex flex-wrap gap-3">
        {links.map((link, index) => (
          <Button key={link.href} asChild size="lg" variant={index === 0 ? 'default' : 'outline'}>
            <a href={link.href}>{link.label}</a>
          </Button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        {downloads.version ? `Version ${downloads.version}. ` : null}
        {downloads.mac.length > 0 ? (
          <>
            Unsigned Mac zip. macOS quarantines the download and reports the app as damaged. Unzip it, then in that folder run{' '}
            <code className="text-foreground">xattr -cr DeskGarage.app</code> before opening it.
          </>
        ) : (
          'The Mac download is published with each GitHub release.'
        )}{' '}
        <a className="text-foreground underline-offset-4 hover:underline" href={downloads.releaseUrl}>
          {downloads.version ? 'Release notes' : 'Releases'}
        </a>
      </p>
    </div>
  );
}
