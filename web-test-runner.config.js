import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
  files: ['test/**/*.test.js'],
  nodeResolve: true,
  coverage: true,
  coverageConfig: {
    exclude: ['test/', '**/*.d.ts'],
  },
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
    playwrightLauncher({ product: 'firefox' }),
    playwrightLauncher({ product: 'webkit' }),
  ],
  testFramework: {
    config: {
      ui: 'bdd',
      timeout: 5000,
    },
  },
};
