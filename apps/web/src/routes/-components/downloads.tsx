import { Button } from '@desk-garage/ui/button';
import { useEffect, useState } from 'react';
import type { Downloads, MacArch } from '../../downloads';

export function DownloadLinks({ downloads }: { downloads: Downloads }) {
  const [arch, setArch] = useState<MacArch>(downloads.mac[0]?.arch ?? 'arm64');
  const [unsupported, setUnsupported] = useState(false);
  const download = downloads.mac.find((item) => item.arch === arch);

  useEffect(() => {
    let active = true;
    const isMac = /Macintosh|Mac OS X/.test(navigator.userAgent) && navigator.maxTouchPoints < 2;

    setUnsupported(!isMac);

    if (isMac && 'userAgentData' in navigator) {
      const data = navigator.userAgentData;

      if (data && typeof data === 'object' && 'getHighEntropyValues' in data && typeof data.getHighEntropyValues === 'function') {
        Promise.resolve(data.getHighEntropyValues(['architecture']))
          .then((values: unknown) => {
            if (active && values && typeof values === 'object' && 'architecture' in values) {
              if (values.architecture === 'arm' && downloads.mac.some((item) => item.arch === 'arm64')) {
                setArch('arm64');
              } else if (values.architecture === 'x86' && downloads.mac.some((item) => item.arch === 'x64')) {
                setArch('x64');
              }
            }
          })
          .catch(() => {});
      }
    }

    return () => {
      active = false;
    };
  }, [downloads.mac]);

  return (
    <div id="download" className="flex max-w-xl flex-col items-start gap-3">
      {download ? (
        <Button asChild size="lg">
          <a href={download.href} download>
            {unsupported ? 'Download for macOS' : download.label}
          </a>
        </Button>
      ) : (
        <Button size="lg" disabled>
          Download unavailable
        </Button>
      )}
      {downloads.mac.length > 1 ? (
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Mac processor
          <select
            aria-label="Mac processor"
            className="rounded-md border border-border bg-background px-2 py-1 text-foreground"
            value={arch}
            onChange={(event) => setArch(event.target.value === 'x64' ? 'x64' : 'arm64')}
          >
            <option value="arm64">Apple silicon</option>
            <option value="x64">Intel</option>
          </select>
        </label>
      ) : null}
      <p className="text-sm text-muted-foreground">
        {unsupported ? 'Available for macOS only. ' : 'Check your Mac processor if it was not detected correctly. '}
      </p>
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
