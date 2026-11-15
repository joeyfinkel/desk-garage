import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { loadDownloads } from '../downloads';
import { DownloadsPage } from './-components/downloads-page';

const getDownloads = createServerFn({ method: 'GET' }).handler(() => loadDownloads());

export const Route = createFileRoute('/downloads')({
  loader: () => getDownloads(),
  head: () => ({ meta: [{ title: 'Downloads · DeskGarage' }] }),
  component: Downloads,
});

function Downloads() {
  const downloads = Route.useLoaderData();

  return <DownloadsPage downloads={downloads} />;
}
