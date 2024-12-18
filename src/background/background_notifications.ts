import { PanelNotificationsType } from "../types";

export const notifications = {
  id: () => `${Math.random().toString(36).substring(2, 8)}`,
  make: (msg: string, panelNotify: PanelNotificationsType, estimatedTime:number, id: string) => {
    chrome.storage.session.set({ notifyText: panelNotify, estimatedTime });
    return chrome.notifications.create(id, {
      title: 'Word Salad Sifter',
      message: msg,
      iconUrl: chrome.runtime.getURL('./images/icon128.png'),
      type: 'basic',
      requireInteraction: true,
    });
  },
  update: (msg: string, panelNotify: PanelNotificationsType, id: string) => {
    chrome.storage.session.set({ notifyText: panelNotify });
    return chrome.notifications.update(id, {
      title: 'Word Salad Sifter',
      message: msg,
      iconUrl: chrome.runtime.getURL('./images/icon128.png'),
      type: 'basic',
      requireInteraction: true,
    });
  },
  error: (msg: string, id: string) => {
    chrome.storage.session.set({ notifyText: 'error' });
    return chrome.notifications.create(`${id}-error`, {
      title: 'Word Salad Sifter',
      message: msg,
      iconUrl: chrome.runtime.getURL('./images/icon128.png'),
      type: 'basic',
      requireInteraction: false,
    });
  },
  panelOnly: (panelNotify: PanelNotificationsType) => {
    chrome.storage.session.set({ notifyText: panelNotify });
  },
  clear: (id: string) => {
    chrome.storage.session.set({ notifyText: 'close' });
    return chrome.notifications.clear(id);
  }
};
