import type { Config } from "jest";

const config: Config = {
    preset: 'ts-jest',
    setupFiles: ["<rootDir>/jest.setup.ts"],
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts'],
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    coverageReporters: ['text-summary', 'lcov'],
};

export default config;
