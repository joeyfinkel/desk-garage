// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router';
import type { WorkspaceCommand, WorkspaceResponse } from '@desk-garage/workspace';
import { routeTree } from '../src/route-tree.gen';

vi.mock('../src/routes/-components/devtools', () => ({
  default: function MockDevtools() {
    return null;
  },
}));

function makeRouter(path: string) {
  return createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [path] }), trailingSlash: 'never' });
}

describe('desktop routes', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('redirects the initial app location to containers', async () => {
    const router = makeRouter('/');
    await router.load();
    expect(router.state.location.pathname).toBe('/containers');
  });

  it('matches creation before the dynamic container route', async () => {
    const router = makeRouter('/containers/new');
    await router.load();
    expect(router.state.matches.at(-1)?.routeId).toBe('/_desktop/containers/new');
  });

  it('reads container selection from a direct URL', async () => {
    const router = makeRouter('/containers/my-headshots');
    await router.load();
    expect(router.state.matches.at(-1)?.params).toMatchObject({ containerId: 'my-headshots' });
  });

  it('matches trash without a container selection', async () => {
    const router = makeRouter('/trash');
    await router.load();
    expect(router.state.matches.at(-1)?.routeId).toBe('/_desktop/trash');
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

  it('keeps quick access routes separate from the full desktop shell', async () => {
    const router = makeRouter('/quick?containerId=my-headshots');
    await router.load();
    expect(router.state.matches.some((match) => match.routeId === '/_desktop')).toBe(false);
    expect(router.state.location.search).toMatchObject({ containerId: 'my-headshots' });
    await router.navigate({ to: '/quick/new', search: { containerId: 'my-headshots' } });
    expect(router.state.location.pathname).toBe('/quick/new');
    await router.navigate({ to: '/quick/trash', search: { containerId: 'my-headshots' } });
    expect(router.state.location.pathname).toBe('/quick/trash');
  });

  it('keeps branding and selection in the window header and imports through ordered overflow actions', async () => {
    const commands: WorkspaceCommand[] = [];

    const command = async (input: WorkspaceCommand): Promise<WorkspaceResponse> => {
      commands.push(input);

      return {
        ok: true,
        value: { version: 1, revision: 1, containers: [{ id: 'everyday', name: 'Everyday', deletedAt: null }], items: [] },
      };
    };

    window.deskGarage = {
      command,
      importDropped: async () => ({ ok: false, error: 'unused' }),
      dragFile: () => {},
      openMain: async () => {},
      hideQuick: () => {},
      onChanged: () => () => {},
    };
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    localStorage.clear();
    const router = makeRouter('/containers/everyday');
    await router.load();
    const element = document.createElement('div');
    document.body.append(element);
    const root = createRoot(element);

    try {
      await act(async () => root.render(createElement(RouterProvider, { router })));
      const header = element.querySelector('header');
      expect(header?.textContent).toContain('Desk Garage');
      expect(header?.querySelector('h1')?.textContent).toBe('Everyday');
      expect(element.querySelector('main h2')).toBeNull();
      const collapse = header?.querySelector<HTMLButtonElement>('button[data-sidebar="trigger"]');
      expect(collapse).not.toBeNull();
      const brand = header?.querySelector('a');
      expect(brand?.previousElementSibling).toBe(collapse);
      await act(async () => collapse?.click());
      expect(header?.textContent).not.toContain('Desk Garage');
      expect(header?.querySelector('h1')?.textContent).toBe('Everyday');
      expect(header?.querySelectorAll('h1')).toHaveLength(1);
      await act(async () => collapse?.click());
      expect(header?.textContent).toContain('Desk Garage');

      expect(element.querySelector('a[href="/containers/new"]')).toBeNull();
      const create = element.querySelector<HTMLButtonElement>('button[aria-label="Create container"]');
      expect(create?.getAttribute('data-sidebar')).toBe('group-action');
      await act(async () => create?.click());
      expect(document.querySelector('[data-slot="dialog-content"]')?.textContent).toContain('New container');
      await act(async () => {
        Array.from(document.querySelectorAll<HTMLButtonElement>('[data-slot="dialog-content"] button'))
          .find((button) => button.textContent === 'Cancel')
          ?.click();
      });
      expect(document.querySelector('[data-slot="dialog-content"]')).toBeNull();
      expect(element.querySelector('button[aria-label="Edit Everyday"]')?.getAttribute('data-sidebar')).toBe('menu-action');
      expect(element.querySelector('button[aria-label="Move Everyday to trash"]')?.getAttribute('data-sidebar')).toBe('menu-action');
      expect(Array.from(element.querySelectorAll('button')).some((button) => button.textContent === 'Add files')).toBe(false);
      const trigger = element.querySelector<HTMLButtonElement>('button[aria-label="Container actions"]');
      expect(trigger).not.toBeNull();
      await act(async () => trigger?.click());
      const popover = document.querySelector('[data-slot="popover-content"]');
      const actions = Array.from(popover?.querySelectorAll('button') ?? []);
      expect(actions.map((button) => button.textContent)).toEqual(['Add file', 'Add note', 'Edit container', 'Delete container']);
      await act(async () => actions[0]?.click());
      expect(commands).toContainEqual({ type: 'pickFiles', containerId: 'everyday' });
      await act(async () => trigger?.click());
      const edit = Array.from(document.querySelectorAll('[data-slot="popover-content"] button')).find(
        (button) => button.textContent === 'Edit container',
      );
      await act(async () => edit?.dispatchEvent(new MouseEvent('click', { bubbles: true })));
      const dialog = document.querySelector('[data-slot="dialog-content"]');
      expect(dialog?.getAttribute('role')).toBe('dialog');
      expect(dialog?.textContent).toContain('Edit container');
      expect(document.querySelector('[data-slot="sheet-content"]')).toBeNull();
      const name = dialog?.querySelector<HTMLInputElement>('input');
      expect(name?.value).toBe('Everyday');
      const cancel = Array.from(dialog?.querySelectorAll('button') ?? []).find((button) => button.textContent === 'Cancel');
      await act(async () => cancel?.click());
      expect(document.querySelector('[data-slot="dialog-content"]')).toBeNull();
      const remove = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-slot="popover-content"] button')).find(
        (button) => button.textContent === 'Delete container',
      );
      await act(async () => remove?.click());
      expect(document.querySelector('[data-slot="dialog-content"]')?.textContent).toContain('Delete container?');
      expect(commands.some((entry) => entry.type === 'trashContainer')).toBe(false);
      await act(async () => {
        Array.from(document.querySelectorAll<HTMLButtonElement>('[data-slot="dialog-content"] button'))
          .find((button) => button.textContent === 'Cancel')
          ?.click();
      });
      expect(document.querySelector('[data-slot="dialog-content"]')).toBeNull();
    } finally {
      await act(async () => root.unmount());
      element.remove();
      delete window.deskGarage;
    }
  });

  it('shows loading, recoverable storage errors, then not found only after a successful read', async () => {
    let completeLoad: ((response: WorkspaceResponse) => void) | undefined;
    const command = vi.fn(
      () =>
        new Promise<WorkspaceResponse>((resolve) => {
          completeLoad = resolve;
        }),
    );
    window.deskGarage = {
      command,
      importDropped: async () => ({ ok: false, error: 'unused' }),
      dragFile: () => {},
      openMain: async () => {},
      hideQuick: () => {},
      onChanged: () => () => {},
    };
    localStorage.clear();
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    const router = makeRouter('/containers/missing');
    await router.load();
    const element = document.createElement('div');
    document.body.append(element);
    const root = createRoot(element);

    try {
      await act(async () => root.render(createElement(RouterProvider, { router })));
      expect(element.querySelector('[role="status"]')?.textContent).toContain('Loading your garage');
      expect(element.textContent).not.toContain('Container not found');
      await act(async () => completeLoad?.({ ok: false, error: 'Disk unavailable. Saved data is preserved.' }));
      expect(element.querySelector('[role="alert"]')?.textContent).toContain('Disk unavailable');
      expect(element.textContent).not.toContain('Container not found');
      expect(element.textContent).not.toContain('Create a container to get started');
      const retry = Array.from(element.querySelectorAll('button')).find((button) => button.textContent === 'Try again');
      expect(retry).toBeDefined();
      await act(async () => retry?.click());
      expect(command).toHaveBeenCalledTimes(2);
      expect(element.querySelector('[role="status"]')).not.toBeNull();
      await act(async () => completeLoad?.({ ok: true, value: { version: 1, revision: 0, containers: [], items: [] } }));
      expect(element.textContent).toContain('Container not found');
      expect(element.textContent).toContain('Look in trash');
      expect(element.querySelector('[role="alert"]')).toBeNull();
    } finally {
      await act(async () => root.unmount());
      element.remove();
      delete window.deskGarage;
    }
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
