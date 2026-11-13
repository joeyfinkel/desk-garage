import { createHashHistory, createRouter } from '@tanstack/react-router';
import { routeTree } from './route-tree.gen';

export const router = createRouter({ routeTree, history: createHashHistory(), trailingSlash: 'never' });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
