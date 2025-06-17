// jest.config.mjs
export default {
  testEnvironment: 'node',
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  transform: {}, // keep empty for pure ESM + native JS
  resolver: undefined,
};