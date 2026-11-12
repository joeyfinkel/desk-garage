import stylistic from '@stylistic/eslint-plugin';
import typescriptEslint from 'typescript-eslint';

export default [
  { ignores: ['**/dist/**', '**/dist-electron/**', '**/node_modules/**', '**/route-tree.gen.ts'] },
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx,mts,cts}'],
    languageOptions: { parser: typescriptEslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { '@stylistic': stylistic },
    rules: {
      curly: ['error', 'all'],
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'import', next: '*' },
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: 'block-like', next: '*' },
        { blankLine: 'always', prev: '*', next: 'block-like' },
        { blankLine: 'never', prev: 'import', next: 'import' },
      ],
    },
  },
];
