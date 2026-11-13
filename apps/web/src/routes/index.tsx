import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { loadDownloads } from '../downloads';
import { LandingPage } from './-components/page';

const getDownloads = createServerFn({ method: 'GET' }).handler(() => loadDownloads());

export const Route = createFileRoute('/')({
  loader: () => getDownloads(),
  component: Home,
});

function Home() {
  const downloads = Route.useLoaderData();

  return <LandingPage downloads={downloads} />;
}
