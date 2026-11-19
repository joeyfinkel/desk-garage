// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vite-plus/test';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { defineResourceLayout } from './layout/base';
import { renderToStaticMarkup } from 'react-dom/server';
import { GaragePage } from '../containers/-pages-config';

describe('workspace layout contracts', () => {
  it('renders implicit children with optional slots omitted', () => {
    const markup = renderToStaticMarkup(
      <GaragePage>
        <span>Saved files</span>
      </GaragePage>,
    );

    expect(markup).toContain('Saved files');
    expect(markup).toContain('aria-label="Your garage"');
  });

  it('accepts React elements in optional content slots', () => {
    const markup = renderToStaticMarkup(
      <GaragePage summary={<strong>Everything on this device</strong>}>
        <span>Saved files</span>
      </GaragePage>,
    );

    expect(markup).toContain('<strong>Everything on this device</strong>');
    expect(markup).toContain('Saved files');
  });

  it('renders error and not-found states with optional actions omitted', () => {
    const error = renderToStaticMarkup(<GaragePage.Error />);
    const notFound = renderToStaticMarkup(<GaragePage.NotFound />);

    expect(error).toContain('Your garage didn&#x27;t open');
    expect(error).toContain('Saved files are still on this device. Try again.');
    expect(notFound).toContain('Container not found');
  });
});

describe('lazy resource modules', () => {
  it('shows code loading, recovers from a failed module, and retries successfully', async () => {
    let rejectLoad: ((error: Error) => void) | undefined;
    const load = vi.fn(
      () =>
        new Promise<{ ResourcePage: typeof GaragePage }>((_resolve, reject) => {
          rejectLoad = reject;
        }),
    );
    const Page = defineResourceLayout.lazy({ resource: 'containers', load });
    const element = document.createElement('div');
    const root = createRoot(element);
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);

    try {
      await act(async () => root.render(<Page>Saved files</Page>));
      expect(element.querySelector('[role="status"]')?.textContent).toContain('Loading page');
      await act(async () => rejectLoad?.(new Error('Chunk unavailable')));
      expect(element.querySelector('[role="alert"]')?.textContent).toContain("This page couldn't finish loading");
      load.mockResolvedValue({ ResourcePage: GaragePage });
      const retry = Array.from(element.querySelectorAll('button')).find((button) => button.textContent === 'Try again');
      expect(retry).toBeDefined();
      await act(async () => retry?.click());
      expect(load).toHaveBeenCalledTimes(2);
      expect(element.textContent).toContain('Saved files');
      expect(element.querySelector('[role="alert"]')).toBeNull();
    } finally {
      await act(async () => root.unmount());
      vi.unstubAllGlobals();
    }
  });
});
