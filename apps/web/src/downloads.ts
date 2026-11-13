const releasesUrl = 'https://github.com/joeyfinkel/desk-garage/releases';
const releasesApiUrl = 'https://api.github.com/repos/joeyfinkel/desk-garage/releases?per_page=20';
const cacheTtlMs = 15 * 60 * 1000;
const macAssetName = /^DeskGarage-.+-(arm64|x64)\.zip$/;

export type MacArch = 'arm64' | 'x64';

export type MacDownload = {
  arch: MacArch;
  label: string;
  href: string;
};

export type Downloads = {
  version: string | null;
  releaseUrl: string;
  mac: MacDownload[];
};

const macDownloadLabel: Record<MacArch, string> = {
  arm64: 'Download for Apple silicon',
  x64: 'Download for Intel',
};

type ReleaseAsset = {
  name: string;
  browser_download_url: string;
};

type Release = {
  tag_name: string;
  html_url: string;
  assets: ReleaseAsset[];
};

let cachedDownloads: { at: number; downloads: Downloads } | null = null;

export function clearDownloadsCache() {
  cachedDownloads = null;
}

export function unavailableDownloads(): Downloads {
  return { version: null, releaseUrl: releasesUrl, mac: [] };
}

export function downloadsFromReleases(releases: Release[]): Downloads {
  for (const release of releases) {
    const mac = macDownloads(release);

    if (mac.length > 0) {
      return { version: release.tag_name.replace(/^v/, ''), releaseUrl: release.html_url, mac };
    }
  }

  return unavailableDownloads();
}

export async function loadDownloads(fetchImpl: typeof fetch = fetch): Promise<Downloads> {
  const now = Date.now();

  if (cachedDownloads && now - cachedDownloads.at < cacheTtlMs) {
    return cachedDownloads.downloads;
  }

  const downloads = await readDownloads(fetchImpl);

  if (downloads.mac.length > 0) {
    cachedDownloads = { at: now, downloads };
  }

  return downloads;
}

async function readDownloads(fetchImpl: typeof fetch): Promise<Downloads> {
  try {
    const response = await fetchImpl(releasesApiUrl, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'desk-garage-web',
      },
    });

    if (!response.ok) {
      return unavailableDownloads();
    }

    const payload: unknown = await response.json();

    return downloadsFromReleases(parseReleases(payload));
  } catch {
    return unavailableDownloads();
  }
}

function macDownloads(release: Release): MacDownload[] {
  const downloads = new Map<MacArch, MacDownload>();

  for (const asset of release.assets) {
    const match = macAssetName.exec(asset.name);
    const arch = match?.[1];

    if ((arch === 'arm64' || arch === 'x64') && !downloads.has(arch) && asset.browser_download_url.startsWith('https://')) {
      downloads.set(arch, { arch, label: macDownloadLabel[arch], href: asset.browser_download_url });
    }
  }

  return (['arm64', 'x64'] as const).flatMap((arch) => {
    const download = downloads.get(arch);

    return download ? [download] : [];
  });
}

function parseReleases(payload: unknown): Release[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.flatMap(parseRelease);
}

function parseRelease(value: unknown): Release[] {
  if (!isRecord(value) || typeof value.tag_name !== 'string' || typeof value.html_url !== 'string' || !Array.isArray(value.assets)) {
    return [];
  }

  return [{ tag_name: value.tag_name, html_url: value.html_url, assets: value.assets.flatMap(parseAsset) }];
}

function parseAsset(value: unknown): ReleaseAsset[] {
  if (!isRecord(value) || typeof value.name !== 'string' || typeof value.browser_download_url !== 'string') {
    return [];
  }

  return [{ name: value.name, browser_download_url: value.browser_download_url }];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
