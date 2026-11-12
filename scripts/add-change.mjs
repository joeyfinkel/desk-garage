import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';
import { changeDocument, changeFilename } from './release-version.mjs';

const bumps = { 1: 'patch', 2: 'minor', 3: 'major', patch: 'patch', minor: 'minor', major: 'major' };

const { values } = parseArgs({
  options: {
    bump: { type: 'string' },
    summary: { type: 'string' },
  },
});

async function ask() {
  if (values.bump) {
    return { bump: values.bump, summary: values.summary ?? '' };
  }

  if (!process.stdin.isTTY) {
    throw new Error('Run pnpm changeset in a terminal, or pass --bump patch|minor|major and --summary.');
  }

  const prompt = createInterface({ input: process.stdin, output: process.stdout });

  try {
    process.stdout.write('Which bump is this?\n  1. patch\n  2. minor\n  3. major\n');
    const bump = bumps[(await prompt.question('> ')).trim()];

    if (!bump) {
      throw new Error('Choose patch, minor, or major.');
    }

    const summary = (await prompt.question('Summary\n> ')).trim();

    return { bump, summary };
  } finally {
    prompt.close();
  }
}

const { bump, summary } = await ask();
const directory = '.changes';

mkdirSync(directory, { recursive: true });

const filename = changeFilename(new Set(readdirSync(directory)));
const path = join(directory, filename);

writeFileSync(path, changeDocument(bump, summary));
process.stdout.write(`${path}\n`);
