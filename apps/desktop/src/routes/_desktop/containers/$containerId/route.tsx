import { createFileRoute } from '@tanstack/react-router';
import { renderContainersPage } from '../index';

const renderContainerDetailPage = renderContainersPage.forResource('detail');

export const Route = createFileRoute('/_desktop/containers/$containerId')({
  ...renderContainerDetailPage({ component: '*' }),
});
