/* eslint-disable @typescript-eslint/no-explicit-any */
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
    },
  },
  tabs: {
    query: jest.fn(),
  },
} as any;