import { defineConfig } from 'vite-plus';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
  },
  run: {
    tasks: {
      build: { command: 'tsc -p tsconfig.build.json', dependsOn: [{ task: 'build', from: ['dependencies', 'devDependencies'] }] },
      typecheck: { command: 'tsc', dependsOn: [{ task: 'build', from: ['dependencies', 'devDependencies'] }] },
      test: { command: 'vp test run', dependsOn: [{ task: 'build', from: ['dependencies', 'devDependencies'] }] },
    },
  },
});
