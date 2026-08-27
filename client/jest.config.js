export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/main.tsx'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.app.json', diagnostics: false, isolatedModules: true }]
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  }
};
