import { defineResourceLayout } from '../../../-utils/layout/base';
import { defaultState } from './states/default';
import { loadingState } from './states/loading';
import { errorState } from './states/error';
import { notFoundState } from './states/not-found';
import { detailState } from './states/detail/default';
import { detailLoadingState } from './states/detail/loading';
import { detailErrorState } from './states/detail/error';
import { detailNotFoundState } from './states/detail/not-found';
import { newState } from './states/new/default';
import { newLoadingState } from './states/new/loading';
import { newErrorState } from './states/new/error';
import { newNotFoundState } from './states/new/not-found';

const { createResourceLayout } = defineResourceLayout({
  render: {
    ...defaultState,
    ...loadingState,
    ...errorState,
    ...notFoundState,
    ...detailState,
    ...detailLoadingState,
    ...detailErrorState,
    ...detailNotFoundState,
    ...newState,
    ...newLoadingState,
    ...newErrorState,
    ...newNotFoundState,
  },
});

export const ResourcePage = createResourceLayout({ resource: 'containers', name: 'ContainersRoute', title: 'Your garage' });
