const VERSION = /^(\d+)\.(\d+)\.(\d+)(?:-(alpha|beta)\.(\d+))?$/;

export const releasePackages = [
  { name: 'desk-garage', file: 'package.json' },
  { name: 'desk-garage-desktop', file: 'apps/desktop/package.json' },
  { name: 'desk-garage-web', file: 'apps/web/package.json' },
  { name: '@desk-garage/containers', file: 'packages/containers/package.json' },
  { name: '@desk-garage/theme', file: 'packages/theme/package.json' },
  { name: '@desk-garage/ui', file: 'packages/ui/package.json' },
  { name: '@desk-garage/workspace', file: 'packages/workspace/package.json' },
];

export const releasePackageFiles = releasePackages.map((pkg) => pkg.file);

export function parseVersion(version) {
  const match = VERSION.exec(version);

  if (!match) {
    throw new Error(`Expected a stable, alpha, or beta version, received '${version}'.`);
  }

  return {
    core: `${match[1]}.${match[2]}.${match[3]}`,
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    channel: match[4] ?? 'stable',
    number: match[5] === undefined ? null : Number(match[5]),
  };
}

const bumpRank = { patch: 0, minor: 1, major: 2 };

function bumpCore(core, bump) {
  const { major, minor, patch } = parseVersion(core);

  if (bump === 'major') {
    return `${major + 1}.0.0`;
  }

  if (bump === 'minor') {
    return `${major}.${minor + 1}.0`;
  }

  return `${major}.${minor}.${patch + 1}`;
}

export function isChannelVersion(version, channel) {
  try {
    return parseVersion(version).channel === channel;
  } catch {
    return false;
  }
}

function compareCore(left, right) {
  const a = parseVersion(left);
  const b = parseVersion(right);

  return a.major - b.major || a.minor - b.minor || a.patch - b.patch || (a.number ?? -1) - (b.number ?? -1);
}

export function highestRelease(versions, channel) {
  let best;

  for (const version of versions) {
    if (!version || !isChannelVersion(version, channel)) {
      continue;
    }

    if (!best || compareCore(version, best) > 0) {
      best = version;
    }
  }

  return best;
}

const changeWords = ['amber', 'brisk', 'calm', 'daisy', 'ember', 'flint', 'gentle', 'harbor', 'ivory', 'juniper'];

export function changeDocument(releases, summary) {
  if (!Array.isArray(releases) || releases.length === 0) {
    throw new Error('Name at least one package.');
  }

  const lines = releases.map((release) => {
    if (!(release.bump in bumpRank)) {
      throw new Error(`Expected patch, minor, or major, received '${release.bump}'.`);
    }

    if (!release.name || /\s/.test(release.name)) {
      throw new Error(`Expected a package name, received '${release.name ?? ''}'.`);
    }

    return `${release.bump} ${release.name}`;
  });
  const note = summary.trim();

  return note ? `${lines.join('\n')}\n\n${note}\n` : `${lines.join('\n')}\n`;
}

export function selectedPackages(answer, packages = releasePackages) {
  const picks = answer
    .split(/[,\s]+/)
    .map((pick) => pick.trim())
    .filter((pick) => pick);
  const names = [];
  const seen = new Set();

  if (picks.length === 0) {
    throw new Error('Name at least one package.');
  }

  for (const pick of picks) {
    const index = Number(pick);
    const numbered = Number.isInteger(index) && String(index) === pick;
    const name =
      numbered && index >= 1 && index <= packages.length ? packages[index - 1].name : packages.find((pkg) => pkg.name === pick)?.name;

    if (!name) {
      throw new Error(`Unknown package '${pick}'.`);
    }

    if (!seen.has(name)) {
      seen.add(name);
      names.push(name);
    }
  }

  return names;
}

export function changeFilename(existing, random = Math.random) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const name = Array.from({ length: 3 }, () => changeWords[Math.floor(random() * changeWords.length)]).join('-');
    const filename = `${name}.md`;

    if (!existing.has(filename)) {
      return filename;
    }
  }

  throw new Error('Could not find a free change filename.');
}

export function readChange(source, filename = '.changes') {
  const [head = '', ...notes] = source.trim().split(/\n\n/);
  const releases = head
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line)
    .map((line) => {
      const match = /^(patch|minor|major)\s+(\S+)$/.exec(line);

      if (!match) {
        throw new Error(`${filename} must list a bump and a package, for example 'patch desk-garage-desktop'.`);
      }

      return { bump: match[1], name: match[2] };
    });

  if (releases.length === 0) {
    throw new Error(`${filename} must name at least one package.`);
  }

  return { releases, summary: notes.join('\n\n').trim() };
}

export function packageBumps(changes, packages = releasePackages) {
  const allowed = new Set(packages.map((pkg) => pkg.name));
  const bumps = new Map();

  for (const change of changes) {
    for (const release of change.releases) {
      if (!allowed.has(release.name)) {
        throw new Error(`Unknown package '${release.name}'.`);
      }

      const current = bumps.get(release.name);

      bumps.set(release.name, current ? highestBump([current, release.bump]) : release.bump);
    }
  }

  return bumps;
}

export function packageReleasePlan({ versions, bumps, channel, desktopTags = [], packages = releasePackages }) {
  const plan = [];

  for (const pkg of packages) {
    const bump = bumps.get(pkg.name);

    if (!bump) {
      continue;
    }

    const current = versions.get(pkg.name);

    if (!current) {
      throw new Error(`Package ${pkg.name} is missing a version.`);
    }

    const version =
      pkg.name === 'desk-garage-desktop'
        ? nextChannelVersion(current, desktopTags, channel, bump)
        : nextReleaseVersion(current, channel, bump);

    plan.push({ name: pkg.name, file: pkg.file, version });
  }

  return plan;
}

export function highestBump(bumps) {
  let best = 'patch';

  for (const bump of bumps) {
    if (!(bump in bumpRank)) {
      throw new Error(`Expected patch, minor, or major, received '${bump}'.`);
    }

    if (bumpRank[bump] > bumpRank[best]) {
      best = bump;
    }
  }

  return best;
}

export function nextReleaseVersion(version, channel, bump = 'patch') {
  const parsed = parseVersion(version);

  if (!(bump in bumpRank)) {
    throw new Error(`Expected patch, minor, or major, received '${bump}'.`);
  }

  if (channel === 'stable') {
    return parsed.channel === 'stable' || bump !== 'patch' ? bumpCore(parsed.core, bump) : parsed.core;
  }

  if (channel !== 'alpha' && channel !== 'beta') {
    throw new Error(`Expected release channel alpha, beta, or stable, received '${channel}'.`);
  }

  if (parsed.channel === channel && bump === 'patch') {
    return `${parsed.core}-${channel}.${parsed.number + 1}`;
  }

  const core = parsed.channel === 'stable' || bump !== 'patch' ? bumpCore(parsed.core, bump) : parsed.core;

  return `${core}-${channel}.0`;
}

export function nextChannelVersion(packageVersion, taggedVersions, channel, bump = 'patch') {
  const onChannel = highestRelease([packageVersion, ...taggedVersions], channel);

  return nextReleaseVersion(onChannel ?? packageVersion, channel, bump);
}

export function readPackageVersion(source) {
  const match = /"version": "([^"]+)"/.exec(source);

  if (!match) {
    throw new Error('Package is missing a version.');
  }

  return match[1];
}

export function writePackageVersion(source, version) {
  if (!/"version": "[^"]+"/.test(source)) {
    throw new Error('Package is missing a version.');
  }

  return source.replace(/"version": "[^"]+"/, `"version": "${version}"`);
}

export function isReleaseCommit(subject) {
  return subject.startsWith('chore(release):');
}

export function releaseNotes({ version, commits, previousTag, summaries = [], packages = [] }) {
  const notes = summaries.filter((summary) => summary);
  const summaryBlock = notes.length > 0 ? `${notes.map((summary) => `- ${summary}`).join('\n')}\n\n` : '';
  const packageBlock = packages.length > 0 ? `### Packages\n\n${packages.map((pkg) => `- ${pkg.name} ${pkg.version}`).join('\n')}\n\n` : '';
  const items = commits.length > 0 ? commits.map((commit) => `- ${commit}`).join('\n') : '- No listed changes.';
  const compare = previousTag && version ? `\n\n**Full changelog**: ${previousTag}...v${version}` : '';

  return `## What's Changed\n\n${summaryBlock}${packageBlock}${items}${compare}\n`;
}
