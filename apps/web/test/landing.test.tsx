// @vitest-environment jsdom

import { act, createElement, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vite-plus/test';
import type { Downloads } from '../src/downloads';
import { LandingPage } from '../src/routes/-components/page';

const downloads: Downloads = {
  version: '1.0.0-alpha.1',
  releaseUrl: 'https://github.com/joeyfinkel/desk-garage/releases/tag/v1.0.0-alpha.1',
  mac: [
    {
      arch: 'arm64',
      label: 'Download for Apple silicon',
      href: 'https://github.com/joeyfinkel/desk-garage/releases/download/v1.0.0-alpha.1/DeskGarage-1.0.0-alpha.1-arm64.zip',
    },
    {
      arch: 'x64',
      label: 'Download for Intel',
      href: 'https://github.com/joeyfinkel/desk-garage/releases/download/v1.0.0-alpha.1/DeskGarage-1.0.0-alpha.1-x64.zip',
    },
  ],
};

let root: Root | undefined;

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  root = undefined;
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

it('describes DeskGarage and offers one direct Mac download', () => {
  const view = render(createElement(LandingPage, { downloads }));

  expect(view.textContent).toContain('A private home for the files and notes you reach for often.');
  expect(view.textContent).toContain('Stays in the menu bar');
  expect(view.textContent).toContain('Notes you can paste');
  expect(view.querySelector('a[href$="arm64.zip"]')?.textContent).toBe('Download for macOS');
  expect(view.querySelector('a[href$="arm64.zip"]')?.hasAttribute('download')).toBe(true);
  expect(view.querySelector('a[href$="arm64.zip"]')?.getAttribute('href')).toBe(downloads.mac[0]?.href);
  expect(view.querySelector('a[href$="x64.zip"]')).toBeNull();
  const select = view.querySelector('select');

  act(() => {
    if (select) {
      select.value = 'x64';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  expect(view.querySelector('a[href$="x64.zip"]')).not.toBeNull();
  expect(view.querySelector('a[href$="arm64.zip"]')).toBeNull();
  expect(view.textContent).toContain('Version 1.0.0-alpha.1');
  expect(view.textContent).toContain('xattr -cr DeskGarage.app');
});

it('disables downloading when no Mac zip is available', () => {
  const view = render(
    createElement(LandingPage, {
      downloads: { version: null, releaseUrl: 'https://github.com/joeyfinkel/desk-garage/releases', mac: [] },
    }),
  );

  expect(view.querySelector('button')?.disabled).toBe(true);
  expect(view.textContent).not.toContain('See downloads');
  expect(view.textContent).toContain('published with each GitHub release');
});

it('selects the Intel download from browser architecture hints', async () => {
  vi.stubGlobal('navigator', {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    maxTouchPoints: 0,
    userAgentData: { getHighEntropyValues: async () => ({ architecture: 'x86' }) },
  });
  let view: HTMLElement | undefined;

  await act(async () => {
    view = render(createElement(LandingPage, { downloads }));
  });

  expect(view?.querySelector('a[href$="x64.zip"]')?.textContent).toBe('Download for Intel');
  expect(view?.querySelector('a[href$="arm64.zip"]')).toBeNull();
});

it.each([
  { available: 'arm64', detected: 'x86' },
  { available: 'x64', detected: 'arm' },
])('keeps the available $available download when the browser reports $detected', async ({ available, detected }) => {
  vi.stubGlobal('navigator', {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    maxTouchPoints: 0,
    userAgentData: { getHighEntropyValues: async () => ({ architecture: detected }) },
  });
  const availableDownloads = downloads.mac.filter((item) => item.arch === available);
  let view: HTMLElement | undefined;

  await act(async () => {
    view = render(createElement(LandingPage, { downloads: { ...downloads, mac: availableDownloads } }));
  });

  expect(view?.querySelector(`a[href$="${available}.zip"]`)).not.toBeNull();
  expect(view?.textContent).not.toContain('Download unavailable');
  expect(view?.querySelector('select')).toBeNull();
});

function render(element: ReactElement) {
  const view = document.createElement('div');
  document.body.append(view);
  root = createRoot(view);
  act(() => {
    root?.render(element);
  });

  return view;
}
