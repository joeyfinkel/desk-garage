import stylistic from '@stylistic/eslint-plugin';

import typescriptEslint from 'typescript-eslint';

export default [
  { ignores: ['**/dist/**', '**/node_modules/**'] },
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx,mts,cts}'],
    languageOptions: { parser: typescriptEslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { '@stylistic': stylistic },
    rules: {
      curly: ['error', 'all'],
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'any', prev: 'import', next: 'import' },
        { blankLine: 'always', prev: 'import', next: '*' },
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: 'block-like', next: '*' },
        { blankLine: 'always', prev: '*', next: 'block-like' },
      ],
    },
  },
];
