import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  highestBump,
  highestRelease,
  isChannelVersion,
  isReleaseCommit,
  nextChannelVersion,
  readChange,
  readPackageVersion,
  releaseNotes,
  releasePackageFiles,
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
const packageVersion = readPackageVersion(readFileSync('apps/desktop/package.json', 'utf8'));
const version = nextChannelVersion(packageVersion, taggedVersions, channel, highestBump(changes.map((change) => change.bump)));
const previous = highestRelease(taggedVersions, channel);
const previousTag = previous ? `v${previous}` : '';
const logRange = previousTag ? `${previousTag}..HEAD` : 'HEAD';
const commits = execFileSync('git', ['log', logRange, '--pretty=format:%s'], { encoding: 'utf8' })
  .split('\n')
  .map((subject) => subject.trim())
  .filter((subject) => subject && !isReleaseCommit(subject));

for (const file of releasePackageFiles) {
  writeFileSync(file, writePackageVersion(readFileSync(file, 'utf8'), version));
}

for (const name of changeFiles) {
  rmSync(join(changeDirectory, name));
}

writeFileSync('release-notes.md', releaseNotes({ version, commits, previousTag, summaries: changes.map((change) => change.summary) }));

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\ntag=v${version}\nprerelease=${channel === 'stable' ? 'false' : 'true'}\n`);
}
