const VERSION = /^(\d+)\.(\d+)\.(\d+)(?:-(alpha|beta)\.(\d+))?$/;

export const releasePackageFiles = [
  'package.json',
  'apps/desktop/package.json',
  'apps/web/package.json',
  'packages/containers/package.json',
  'packages/theme/package.json',
  'packages/ui/package.json',
  'packages/workspace/package.json',
];

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

export function changeDocument(bump, summary) {
  if (!(bump in bumpRank)) {
    throw new Error(`Expected patch, minor, or major, received '${bump}'.`);
  }

  const note = summary.trim();

  return note ? `${bump}\n\n${note}\n` : `${bump}\n`;
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
  const [firstLine = '', ...rest] = source.trim().split('\n');
  const bump = firstLine.trim();

  if (!(bump in bumpRank)) {
    throw new Error(`${filename} must start with patch, minor, or major.`);
  }

  return { bump, summary: rest.join('\n').trim() };
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

export function releaseNotes({ version, commits, previousTag, summaries = [] }) {
  const notes = summaries.filter((summary) => summary);
  const summaryBlock = notes.length > 0 ? `${notes.map((summary) => `- ${summary}`).join('\n')}\n\n` : '';
  const items = commits.length > 0 ? commits.map((commit) => `- ${commit}`).join('\n') : '- No listed changes.';
  const compare = previousTag ? `\n\n**Full changelog**: ${previousTag}...v${version}` : '';

  return `## What's Changed\n\n${summaryBlock}${items}${compare}\n`;
}
