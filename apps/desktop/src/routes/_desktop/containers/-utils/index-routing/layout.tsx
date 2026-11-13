import { defineResourceLayout } from '../../../../../utils/layout/base';
import { defaultState } from './default-state';
import { loadingState } from '../../../../../utils/layout/loading-state';
import { errorState } from '../../../../-utils/error-state';
import { notFoundState } from '../../../../-utils/not-found-state';

const { createResourceLayout } = defineResourceLayout({
  render: { ...defaultState, ...loadingState, ...errorState, ...notFoundState },
});

export const ResourcePage = createResourceLayout({ resource: 'containers', name: 'GarageRoute', title: 'Your garage' });
