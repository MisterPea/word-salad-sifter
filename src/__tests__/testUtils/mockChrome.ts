/* eslint-disable @typescript-eslint/no-explicit-any */

type ChromeMock = typeof chrome;
type GlobalChrome = typeof globalThis & { chrome: ChromeMock };

function promiseGet() {
  return jest.fn((key) =>
    Promise.resolve(key ? { [typeof key]: undefined } : {})
  );
}

function createBaseChromeMock(): ChromeMock {
  return {
    identity: {
      getAuthToken: jest.fn(),
      removeCachedAuthToken: jest.fn(),
    },
    runtime: {
      ContextType: { SIDE_PANEL: 'SIDE_PANEL' },
      lastError: undefined,
      getURL: jest.fn((path: string) => path),
      getContexts: jest.fn((_query, callback) => callback([])),
      sendMessage: jest.fn(),
      onInstalled: {
        addListener: jest.fn(),
      },
      onMessage: {
        addListener: jest.fn(),
      },
    },
    sidePanel: {
      setPanelBehavior: jest.fn(() => Promise.resolve()),
    },
    contextMenus: {
      update: jest.fn((_id, _props, callback) => callback?.()),
      create: jest.fn(),
      onClicked: {
        addListener: jest.fn(),
      },
    },
    notifications: {
      clear: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    tabs: {
      query: jest.fn(),
      create: jest.fn(),
      sendMessage: jest.fn(),
    },
    windows: {
      update: jest.fn((_windowId, _updateInfo, callback) => callback?.()),
      create: jest.fn(),
      getCurrent: jest.fn(() => Promise.resolve({ id: 1 })),
    },
    scripting: {
      executeScript: jest.fn(() => Promise.resolve()),
    },
    storage: {
      onChanged: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      },
      local: {
        clear: jest.fn().mockResolvedValue(undefined),
        set: jest.fn().mockResolvedValue(undefined),
        get: promiseGet(),
      },
      sync: {
        clear: jest.fn().mockResolvedValue(undefined),
        set: jest.fn().mockResolvedValue(undefined),
        get: promiseGet(),
      },
      session: {
        clear: jest.fn().mockResolvedValue(undefined),
        set: jest.fn().mockResolvedValue(undefined),
        get: promiseGet(),
      },
    },
  } as ChromeMock;
}

export function installChromeMock(overrides: Partial<ChromeMock> = {}): ChromeMock {
  const chromeMock = Object.assign(createBaseChromeMock(), overrides) as ChromeMock;
  (globalThis as GlobalChrome).chrome = chromeMock;
  window.chrome = chromeMock;
  return chromeMock;
}

export function resetChromeMock(overrides: Partial<ChromeMock> = {}): ChromeMock {
  return installChromeMock(overrides);
}
