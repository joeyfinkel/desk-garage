import { Button } from '@desk-garage/ui/button';
import { ArrowDownToLine } from 'lucide-react';
import type { Downloads } from '../../downloads';
import { useDetectedMacArch } from '../-hooks/use-detected-mac-arch';

export function DownloadsPage({ downloads }: { downloads: Downloads }) {
  const detectedArch = useDetectedMacArch();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-16 px-6 py-8">
      <header className="flex items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-3 text-sm font-medium">
          <img src="/icon.svg" alt="" className="size-9" />
          DeskGarage
        </a>
        <a href="/" className="text-sm text-primary">
          Back to home
        </a>
      </header>
      <main className="flex flex-1 flex-col gap-10">
        <div className="flex max-w-2xl flex-col gap-4">
          <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">Download DeskGarage</h1>
          <p className="text-lg text-muted-foreground">A private home for your files and notes. Pick the build for your Mac.</p>
          <p className="text-sm text-muted-foreground">
            {downloads.version ? `Version ${downloads.version}. ` : null}Currently available for macOS.
          </p>
        </div>
        <section aria-label="Available downloads" className="grid gap-6 sm:grid-cols-2">
          {downloads.mac.map((download) => (
            <article key={download.arch} className="flex flex-col items-start gap-5 rounded-xl border bg-card p-6">
              <div className="flex size-14 items-center justify-center rounded-xl bg-white">
                <img src="/logos/apple.svg" alt="Apple" className="size-8" />
              </div>
              {download.arch === detectedArch ? (
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Recommended for your Mac
                </span>
              ) : null}
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-medium">macOS · {download.arch === 'arm64' ? 'Apple silicon' : 'Intel'}</h2>
                <p className="text-sm text-muted-foreground">
                  {download.arch === 'arm64' ? 'For Macs with an Apple M-series chip.' : 'For Macs with an Intel processor.'}{' '}
                  {download.href.endsWith('.dmg') ? 'DMG installer.' : 'ZIP archive.'}
                </p>
              </div>
              <Button asChild size="lg" className="mt-auto">
                <a href={download.href} download>
                  <ArrowDownToLine aria-hidden="true" />
                  {download.label}
                </a>
              </Button>
            </article>
          ))}
          {downloads.mac.length === 0 ? (
            <p className="text-muted-foreground">Downloads are temporarily unavailable. Please try again shortly.</p>
          ) : null}
        </section>
        <section aria-labelledby="install-heading" className="flex max-w-2xl flex-col gap-3 rounded-xl border p-6">
          <h2 id="install-heading" className="text-lg font-medium">
            Installing on your Mac
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Find your processor in Apple menu → About This Mac. “Chip” means Apple silicon; “Processor” lists your Intel model.
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            Open the DMG and drag DeskGarage into Applications. For older ZIP downloads, unzip and move the app into Applications. These
            builds are unsigned; if macOS blocks the app, run{' '}
            <code className="text-foreground">xattr -cr /Applications/DeskGarage.app</code> before opening the app.
          </p>
        </section>
      </main>
      <footer className="border-t py-8 text-sm text-muted-foreground">
        <a href={downloads.releaseUrl} className="text-foreground underline-offset-4 hover:underline">
          Release notes
        </a>
      </footer>
    </div>
  );
}
