import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  highestRelease,
  isChannelVersion,
  isReleaseCommit,
  packageBumps,
  packageReleasePlan,
  readChange,
  readPackageVersion,
  releaseNotes,
  releasePackages,
  writePackageVersion,
} from './release-version.mjs';

const channel = process.env.RELEASE_CHANNEL;

if (channel !== 'alpha' && channel !== 'beta' && channel !== 'stable') {
  throw new Error(`RELEASE_CHANNEL must be alpha, beta, or stable. Received '${channel ?? ''}'.`);
}

const taggedVersions = execFileSync('git', ['tag', '--list', 'v*'], { encoding: 'utf8' })
  .split('\n')
  .map((tag) => tag.trim().replace(/^v/, ''))
  .filter((version) => isChannelVersion(version, channel));
const changeDirectory = '.changes';
const changeFiles = existsSync(changeDirectory) ? readdirSync(changeDirectory).filter((name) => name.endsWith('.md')) : [];
const changes = changeFiles.map((name) => readChange(readFileSync(join(changeDirectory, name), 'utf8'), name));
const bumps = packageBumps(changes);

if (bumps.size === 0) {
  throw new Error('Add a changeset that names the packages to release.');
}

const versions = new Map(releasePackages.map((pkg) => [pkg.name, readPackageVersion(readFileSync(pkg.file, 'utf8'))]));
const plan = packageReleasePlan({ versions, bumps, channel, desktopTags: taggedVersions });
const desktop = plan.find((pkg) => pkg.name === 'desk-garage-desktop');
const version = desktop?.version ?? '';
const previous = highestRelease(taggedVersions, channel);
const previousTag = previous ? `v${previous}` : '';
const logRange = previousTag ? `${previousTag}..HEAD` : 'HEAD';
const commits = execFileSync('git', ['log', logRange, '--pretty=format:%s'], { encoding: 'utf8' })
  .split('\n')
  .map((subject) => subject.trim())
  .filter((subject) => subject && !isReleaseCommit(subject));

for (const pkg of plan) {
  writeFileSync(pkg.file, writePackageVersion(readFileSync(pkg.file, 'utf8'), pkg.version));
}

for (const name of changeFiles) {
  rmSync(join(changeDirectory, name));
}

writeFileSync(
  'release-notes.md',
  releaseNotes({
    version,
    commits,
    previousTag: version ? previousTag : '',
    summaries: changes.map((change) => change.summary),
    packages: plan,
  }),
);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    `version=${version}\ntag=${version ? `v${version}` : ''}\npublish=${version ? 'true' : 'false'}\nprerelease=${channel === 'stable' ? 'false' : 'true'}\n`,
  );
}
