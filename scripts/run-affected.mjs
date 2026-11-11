// Usage: BASE_SHA=<commit> node scripts/run-affected.mjs <task>...
// Runs each task with Vite+ in the packages changed since BASE_SHA and in the packages that depend on them.
// A change outside every package, or a base that cannot be compared, runs the tasks in every package.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname } from 'node:path';

const tasks = process.argv.slice(2);
const base = process.env.BASE_SHA ?? '';

// Files that no task reads.
const inertPatterns = [/\.md$/, /^\.agents\//, /^\.claude\//, /^jfdevelops\.json$/];

function readChangedFiles() {
  // GitHub reports an all-zero commit before the first push of a branch.
  if (base === '' || /^0+$/.test(base)) {
    return undefined;
  }

  try {
    const output = execFileSync('git', ['diff', '--name-only', `${base}...HEAD`], { encoding: 'utf8' });

    return output.split('\n').filter((file) => file !== '');
  } catch {
    return undefined;
  }
}

// The nearest directory with a package.json below the workspace root, or undefined for a root file.
function findPackageDirectory(file) {
  for (let directory = dirname(file); directory !== '.'; directory = dirname(directory)) {
    if (existsSync(`${directory}/package.json`)) {
      return directory;
    }
  }

  return undefined;
}

function selectPackages() {
  const files = readChangedFiles()?.filter((file) => !inertPatterns.some((pattern) => pattern.test(file)));

  if (files === undefined) {
    return ['-r'];
  }

  const directories = files.map((file) => findPackageDirectory(file));

  if (directories.includes(undefined)) {
    return ['-r'];
  }

  return [...new Set(directories)].flatMap((directory) => ['--filter', `...{${directory}}`]);
}

const selection = selectPackages();

if (selection.length === 0) {
  console.log('No packages are affected by this change.');
  process.exit(0);
}

console.log(`Running ${tasks.join(', ')} with: ${selection.join(' ')}`);

// The workspace's own Vite+ runs without a shell; a global vp, as setup-vp installs, is the fallback.
const localVp = 'node_modules/vite-plus/bin/vp';
const [command, ...prefix] = existsSync(localVp) ? [process.execPath, localVp] : ['vp'];

for (const task of tasks) {
  const result = spawnSync(command, [...prefix, 'run', ...selection, task], {
    stdio: 'inherit',
    shell: command === 'vp' && process.platform === 'win32',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
