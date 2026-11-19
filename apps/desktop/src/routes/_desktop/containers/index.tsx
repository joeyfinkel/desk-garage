import { createFileRoute } from '@tanstack/react-router';
import { renderPage } from '../-page-config';

export const renderContainersPage = renderPage('containers');

export const Route = createFileRoute('/_desktop/containers/')({
  ...renderContainersPage({ component: '*' }),
});
