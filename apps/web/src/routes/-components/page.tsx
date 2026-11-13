import type { Downloads } from '../../downloads';
import { DownloadLinks } from './downloads';
import { WindowPreview } from './preview';

const features = [
  {
    title: 'Stays in the menu bar',
    description:
      'The status icon stays up while DeskGarage is running. A click opens quick access. The full window opens only when you ask for it.',
  },
  {
    title: 'Containers for what you reach for',
    description: 'Group the files that belong together. Quick access and the full window show the same containers.',
  },
  {
    title: 'Drag a file in, drag it back out',
    description: 'Bring in the files you want close at hand. Drag one out, or save a copy, when you need it in another app.',
  },
  {
    title: 'Notes you can paste',
    description: 'Write a note in the list. Drag it into another app to paste the text.',
  },
];

export function LandingPage({ downloads }: { downloads: Downloads }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-16 px-6 py-8">
      <header className="flex items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-3 text-sm font-medium">
          <img src="/icon.svg" alt="" className="size-9" />
          DeskGarage
        </a>
        <a href="#download" className="text-sm text-primary">
          Download
        </a>
      </header>
      <main className="flex flex-1 flex-col gap-20">
        <section className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <h1 className="max-w-xl text-4xl leading-tight font-medium tracking-tight text-balance sm:text-5xl">
              A private home for the files and notes you reach for often.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              DeskGarage sits in the menu bar. Open a container, keep what you need close, and drag it back out when you need it somewhere
              else.
            </p>
            <DownloadLinks downloads={downloads} />
          </div>
          <WindowPreview />
        </section>
        <section className="grid gap-8 sm:grid-cols-2" aria-labelledby="features-heading">
          <h2 id="features-heading" className="sr-only">
            What DeskGarage does
          </h2>
          {features.map((feature) => (
            <article key={feature.title} className="flex flex-col gap-2 rounded-xl border bg-card p-5">
              <h3 className="text-base font-medium">{feature.title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{feature.description}</p>
            </article>
          ))}
        </section>
      </main>
      <footer className="flex flex-col gap-3 border-t py-8 text-sm text-muted-foreground">
        <p>A file you add is a copy on this computer. The original stays where it was. Nothing is uploaded.</p>
        <a className="w-fit text-foreground underline-offset-4 hover:underline" href="https://github.com/joeyfinkel/desk-garage">
          Source on GitHub
        </a>
      </footer>
    </div>
  );
}
