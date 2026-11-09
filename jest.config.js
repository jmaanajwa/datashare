const { createCjsPreset } = require('jest-preset-angular/presets');

module.exports = {
  ...createCjsPreset(),
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  moduleFileExtensions: ['ts', 'html', 'js', 'json'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/app/**/*.ts', '!src/app/**/*.component.html'],
};
