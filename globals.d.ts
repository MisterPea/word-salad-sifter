declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.gif';

declare global {
  interface Window {
    chrome: typeof globalThis.chrome;
  }
  
  const chrome: {
    storage: {
      local: {
        clear: jest.Mock;
        set: jest.Mock;
        get: jest.Mock;
      };
      sync: {
        clear: jest.Mock;
        set: jest.Mock;
        get: jest.Mock;
      };
      session: {
        clear: jest.Mock;
        set: jest.Mock;
        get: jest.Mock;
      };
    };
  };
}

export { };