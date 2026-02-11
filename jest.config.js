module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/tests/setupEnv.js"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/application/use-cases/auth/**/*.js",
    "src/interfaces/http/controllers/**/*.js",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
