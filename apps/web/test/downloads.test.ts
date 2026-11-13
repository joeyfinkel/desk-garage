// @vitest-environment jsdom
// The Node test environment resolves a broken Vite+ path while this app also depends on Vite 8.

import { afterEach, expect, it, vi } from 'vite-plus/test';
import { clearDownloadsCache, downloadsFromReleases, loadDownloads, unavailableDownloads } from '../src/downloads';

const arm64 = {
  name: 'DeskGarage-1.0.0-alpha.1-arm64.zip',
  browser_download_url: 'https://github.com/joeyfinkel/desk-garage/releases/download/v1.0.0-alpha.1/DeskGarage-1.0.0-alpha.1-arm64.zip',
};

const intel = {
  name: 'DeskGarage-1.0.0-alpha.1-x64.zip',
  browser_download_url: 'https://github.com/joeyfinkel/desk-garage/releases/download/v1.0.0-alpha.1/DeskGarage-1.0.0-alpha.1-x64.zip',
};

const release = {
  tag_name: 'v1.0.0-alpha.1',
  html_url: 'https://github.com/joeyfinkel/desk-garage/releases/tag/v1.0.0-alpha.1',
  assets: [intel, arm64],
};

afterEach(() => {
  clearDownloadsCache();
  vi.restoreAllMocks();
});

it('uses the newest release that includes Mac zip files', () => {
  const downloads = downloadsFromReleases([
    { tag_name: 'v9.0.0', html_url: 'https://github.com/joeyfinkel/desk-garage/releases/tag/v9.0.0', assets: [] },
    release,
  ]);

  expect(downloads.version).toBe('1.0.0-alpha.1');
  expect(downloads.releaseUrl).toBe(release.html_url);
  expect(downloads.mac.map((item) => item.arch)).toEqual(['arm64', 'x64']);
  expect(downloads.mac[0]?.href).toBe(arm64.browser_download_url);
  expect(downloads.mac[1]?.label).toBe('Download for Intel');
});

it('links the releases page when no Mac zip is published', () => {
  expect(downloadsFromReleases([])).toEqual(unavailableDownloads());
});

it('reads the GitHub releases list and caches a successful lookup', async () => {
  const fetchImpl = vi.fn(async () => Response.json([release]));
  const first = await loadDownloads(fetchImpl);
  const second = await loadDownloads(fetchImpl);

  expect(first.mac).toHaveLength(2);
  expect(second).toEqual(first);
  expect(fetchImpl).toHaveBeenCalledOnce();
});

it.each(['rate-limit', 'server-error', 'network-error', 'empty', 'malformed'])(
  'keeps direct downloads available after a %s response',
  async (failure) => {
    const fetchImpl = vi.fn(async () => {
      if (failure === 'network-error') {
        throw new Error('Network unavailable');
      }

      if (failure === 'empty') {
        return Response.json([]);
      }

      if (failure === 'malformed') {
        return Response.json({ unexpected: true });
      }

      return Response.json({ message: 'nope' }, { status: failure === 'rate-limit' ? 403 : 500 });
    });
    const first = await loadDownloads(fetchImpl);
    await loadDownloads(fetchImpl);

    expect(first.mac.map((item) => item.href)).toEqual([arm64.browser_download_url, intel.browser_download_url]);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  },
);
