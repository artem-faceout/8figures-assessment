import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testPathIgnorePatterns: ['<rootDir>/e2e/'],
  transformIgnorePatterns: [
    'node_modules/(?!(@ionic|@stencil|ionicons|@angular|@testing-library|tslib)/)',
  ],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@env/(.*)$': '<rootDir>/src/environments/$1',
    '^ionicons/components/(.*)$':
      '<rootDir>/node_modules/ionicons/components/$1',
  },
};

export default config;
