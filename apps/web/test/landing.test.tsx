// @vitest-environment jsdom

import { act, createElement, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, it } from 'vite-plus/test';
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
});

it('describes DeskGarage and links both Mac downloads', () => {
  const view = render(createElement(LandingPage, { downloads }));

  expect(view.textContent).toContain('A private home for the files and notes you reach for often.');
  expect(view.textContent).toContain('Stays in the menu bar');
  expect(view.textContent).toContain('Notes you can paste');
  expect(view.querySelector('a[href$="arm64.zip"]')?.textContent).toBe('Download for Apple silicon');
  expect(view.querySelector('a[href$="x64.zip"]')?.textContent).toBe('Download for Intel');
  expect(view.textContent).toContain('Version 1.0.0-alpha.1');
  expect(view.textContent).toContain('xattr -cr DeskGarage.app');
});

it('points at the releases list when a Mac zip is not available', () => {
  const view = render(
    createElement(LandingPage, {
      downloads: { version: null, releaseUrl: 'https://github.com/joeyfinkel/desk-garage/releases', mac: [] },
    }),
  );

  expect(view.querySelector('a[href="https://github.com/joeyfinkel/desk-garage/releases"]')?.textContent).toBe('See downloads');
  expect(view.textContent).toContain('published with each GitHub release');
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
