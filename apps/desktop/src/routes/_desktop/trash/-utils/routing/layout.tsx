import { defineResourceLayout } from '../../../-utils/layout/base';
import { defaultState } from './states/default';
import { loadingState } from './states/loading';
import { errorState } from './states/error';
import { notFoundState } from './states/not-found';

const { createResourceLayout } = defineResourceLayout({
  render: { ...defaultState, ...loadingState, ...errorState, ...notFoundState },
});

export const ResourcePage = createResourceLayout({ resource: 'trash', name: 'TrashRoute', title: 'Trash' });
