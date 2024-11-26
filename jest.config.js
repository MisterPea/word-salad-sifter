module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts',"@testing-library/jest-dom/extend-expect"],
  moduleNameMapper: {
    '^chrome$': '<rootDir>/__mocks__/chrome.ts',
  },
};