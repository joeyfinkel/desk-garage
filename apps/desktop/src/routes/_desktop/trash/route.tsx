import { createFileRoute } from '@tanstack/react-router';
import { renderPage } from '../-page-config';

const renderTrashPage = renderPage('trash');

export const Route = createFileRoute('/_desktop/trash')({
  ...renderTrashPage({ component: '*' }),
});
