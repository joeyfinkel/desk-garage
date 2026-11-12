import assert from 'node:assert/strict';
import test from 'node:test';
import {
  changeDocument,
  changeFilename,
  highestBump,
  isReleaseCommit,
  nextChannelVersion,
  packageBumps,
  packageReleasePlan,
  readChange,
  releaseNotes,
  selectedPackages,
  writePackageVersion,
} from './release-version.mjs';

test('a pull request into alpha increments that alpha line', () => {
  assert.equal(nextChannelVersion('1.0.0-alpha.0', [], 'alpha'), '1.0.0-alpha.1');
  assert.equal(nextChannelVersion('1.0.0-alpha.9', ['1.0.0-alpha.4'], 'alpha'), '1.0.0-alpha.10');
});

test('a pull request into beta starts or increments the beta line', () => {
  assert.equal(nextChannelVersion('1.0.0-alpha.5', [], 'beta'), '1.0.0-beta.0');
  assert.equal(nextChannelVersion('1.0.0-beta.2', ['1.0.0-beta.2'], 'beta'), '1.0.0-beta.3');
});

test('a pull request into main promotes a prerelease, then increments the stable patch', () => {
  assert.equal(nextChannelVersion('1.0.0-beta.3', [], 'stable'), '1.0.0');
  assert.equal(nextChannelVersion('1.0.0-beta.3', ['1.0.0'], 'stable'), '1.0.1');
  assert.equal(nextChannelVersion('1.0.0', ['1.0.0'], 'stable'), '1.0.1');
});

test('the next prerelease after a stable version uses the next patch', () => {
  assert.equal(nextChannelVersion('1.0.0', ['1.0.0'], 'alpha'), '1.0.1-alpha.0');
  assert.equal(nextChannelVersion('1.0.1', [], 'beta'), '1.0.2-beta.0');
});

test('the change file chooses a minor or major bump on each channel', () => {
  assert.equal(nextChannelVersion('1.0.0', [], 'stable', 'minor'), '1.1.0');
  assert.equal(nextChannelVersion('1.0.0', [], 'stable', 'major'), '2.0.0');
  assert.equal(nextChannelVersion('1.0.0-alpha.4', [], 'alpha', 'minor'), '1.1.0-alpha.0');
  assert.equal(nextChannelVersion('1.0.0-beta.3', [], 'stable', 'major'), '2.0.0');
  assert.equal(nextChannelVersion('1.0.0', [], 'beta', 'minor'), '1.1.0-beta.0');
});

test('a changeset prompt writes a file the release can read', () => {
  const source = changeDocument([{ bump: 'minor', name: 'desk-garage-desktop' }], 'The Dock icon uses the garage drawing.');

  assert.deepEqual(readChange(source, 'amber-brisk-calm.md'), {
    releases: [{ bump: 'minor', name: 'desk-garage-desktop' }],
    summary: 'The Dock icon uses the garage drawing.',
  });
  assert.equal(
    changeFilename(new Set(), () => 0),
    'amber-amber-amber.md',
  );
  const rolls = [0, 0, 0, 0.1, 0.1, 0.1];
  let roll = 0;

  assert.equal(
    changeFilename(new Set(['amber-amber-amber.md']), () => rolls[roll++]),
    'brisk-brisk-brisk.md',
  );
  assert.deepEqual(selectedPackages('1, @desk-garage/ui', [{ name: 'desk-garage-desktop' }, { name: '@desk-garage/ui' }]), [
    'desk-garage-desktop',
    '@desk-garage/ui',
  ]);
});

test('several change files use the highest bump for each named package', () => {
  assert.equal(highestBump(['patch', 'major', 'minor']), 'major');
  assert.deepEqual(readChange('minor @desk-garage/ui\n\nThe Dock icon uses the garage drawing.\n', 'dock-icon.md'), {
    releases: [{ bump: 'minor', name: '@desk-garage/ui' }],
    summary: 'The Dock icon uses the garage drawing.',
  });
  assert.throws(() => readChange('bigger\n', 'notes.md'), /bump and a package/);
  assert.throws(() => packageBumps([readChange('patch not-a-package\n', 'notes.md')]), /Unknown package/);

  const bumps = packageBumps([
    readChange('patch @desk-garage/ui\npatch desk-garage-desktop\n\nMenu bar.\n', 'desktop.md'),
    readChange('major @desk-garage/ui\n\nDialogs.\n', 'ui.md'),
  ]);

  assert.equal(bumps.get('@desk-garage/ui'), 'major');
  assert.equal(bumps.get('desk-garage-desktop'), 'patch');
  assert.equal(bumps.has('@desk-garage/theme'), false);
  assert.deepEqual(
    packageReleasePlan({
      versions: new Map([
        ['@desk-garage/ui', '1.0.0-alpha.0'],
        ['desk-garage-desktop', '1.0.0-alpha.2'],
        ['@desk-garage/theme', '1.0.0-alpha.0'],
      ]),
      bumps,
      channel: 'alpha',
      desktopTags: ['1.0.0-alpha.2'],
    }),
    [
      { name: 'desk-garage-desktop', file: 'apps/desktop/package.json', version: '1.0.0-alpha.3' },
      { name: '@desk-garage/ui', file: 'packages/ui/package.json', version: '2.0.0-alpha.0' },
    ],
  );
});

test('a tag ahead of package.json sets the next number', () => {
  assert.equal(nextChannelVersion('1.0.0-alpha.0', ['1.0.0-alpha.4'], 'alpha'), '1.0.0-alpha.5');
});

test('replaces the version field and leaves the rest of the manifest', () => {
  const source = '{\n  "name": "desk-garage",\n  "version": "1.0.0-alpha.0"\n}\n';

  assert.equal(writePackageVersion(source, '1.0.0-beta.0'), '{\n  "name": "desk-garage",\n  "version": "1.0.0-beta.0"\n}\n');
});

test('writes the commit list and skips calling a release commit a change', () => {
  assert.equal(isReleaseCommit('chore(release): prepare v1.0.0'), true);
  assert.equal(
    releaseNotes({
      version: '1.0.0',
      commits: ['feat(desktop): use the garage drawing as the app icon'],
      previousTag: 'v1.0.0-beta.3',
      packages: [{ name: 'desk-garage-desktop', version: '1.0.0' }],
    }),
    `## What's Changed\n\n### Packages\n\n- desk-garage-desktop 1.0.0\n\n- feat(desktop): use the garage drawing as the app icon\n\n**Full changelog**: v1.0.0-beta.3...v1.0.0\n`,
  );
});
