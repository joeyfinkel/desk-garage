import { defineResourceLayout } from './base';
import { layoutState } from './layout-state';
import { defaultState } from './default-state';
import { loadingState } from './loading-state';
import { errorState } from './error-state';
import { notFoundState } from './not-found-state';

export const workspaceLayout = defineResourceLayout({
  render: { ...layoutState, ...defaultState, ...loadingState, ...errorState, ...notFoundState },
});

export const { createResourceLayout } = workspaceLayout;
