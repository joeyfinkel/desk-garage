// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router';
import { routeTree } from '../src/route-tree.gen';

function makeRouter(path: string) {
  return createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [path] }), trailingSlash: 'never' });
}

describe('desktop routes', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('redirects the initial app location to containers', async () => {
    const router = makeRouter('/');
    await router.load();
    expect(router.state.location.pathname).toBe('/containers');
  });

  it('matches creation before the dynamic container route', async () => {
    const router = makeRouter('/containers/new');
    await router.load();
    expect(router.state.matches.at(-1)?.routeId).toBe('/containers/new');
  });

  it('reads container selection from a direct URL', async () => {
    const router = makeRouter('/containers/my-headshots');
    await router.load();
    expect(router.state.matches.at(-1)?.params).toMatchObject({ containerId: 'my-headshots' });
  });

  it('matches trash without a container selection', async () => {
    const router = makeRouter('/trash');
    await router.load();
    expect(router.state.matches.at(-1)?.routeId).toBe('/trash');
  });

  it('supports back and forward between route locations', async () => {
    const router = makeRouter('/containers/new');
    await router.load();
    await router.navigate({ to: '/trash' });
    expect(router.state.location.pathname).toBe('/trash');
    router.history.back();
    await router.load();
    expect(router.state.location.pathname).toBe('/containers/new');
    router.history.forward();
    await router.load();
    expect(router.state.location.pathname).toBe('/trash');
  });

  it('handles unknown paths with a not-found state', async () => {
    const router = makeRouter('/does-not-exist');
    await router.load();
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    const element = document.createElement('div');
    const root = createRoot(element);

    try {
      await act(async () => {
        root.render(createElement(RouterProvider, { router }));
      });
      expect(element.textContent).toContain('Page not found');
    } finally {
      await act(async () => root.unmount());
      vi.unstubAllGlobals();
    }
  });
});
