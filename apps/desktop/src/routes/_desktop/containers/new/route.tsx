import { createFileRoute } from '@tanstack/react-router';
import { renderContainersPage } from '../index';

const renderContainerNewPage = renderContainersPage.forResource('new');
export const Route = createFileRoute('/_desktop/containers/new')({
  ...renderContainerNewPage({ component: '*' }),
});
