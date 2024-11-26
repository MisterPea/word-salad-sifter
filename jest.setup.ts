/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';

(globalThis as any).chrome = {
  storage: {
    local: {
      clear: jest.fn().mockResolvedValue(undefined),
      set: jest.fn().mockResolvedValue(undefined),
      get: jest.fn((key) =>
        Promise.resolve(key ? { [typeof key]: undefined } : {})
      ),
    },
    sync: {
      clear: jest.fn().mockResolvedValue(undefined),
      set: jest.fn().mockResolvedValue(undefined),
      get: jest.fn((key) =>
        Promise.resolve(key ? { [typeof key]: undefined } : {})
      ),
    },
    session: {
      clear: jest.fn().mockResolvedValue(undefined),
      set: jest.fn().mockResolvedValue(undefined),
      get: jest.fn((key) =>
        Promise.resolve(key ? { [typeof key]: undefined } : {})
      ),
    },
  },
};