import { NotificationState, PanelNotificationsType } from "../types";

function setNotificationState(notifyText: NotificationState, estimatedTime?: number) {
  const payload = estimatedTime === undefined ? { notifyText } : { notifyText, estimatedTime };
  chrome.storage.session.set(payload);
}

export const notifications = {
  id: () => `${Math.random().toString(36).substring(2, 8)}`,
  make: (msg: string, panelNotify: PanelNotificationsType, estimatedTime:number, id: string) => {
    setNotificationState(panelNotify, estimatedTime);
    return chrome.notifications.create(id, {
      title: 'Word Salad Sifter',
      message: msg,
      iconUrl: chrome.runtime.getURL('./images/icon128.png'),
      type: 'basic',
      requireInteraction: true,
    });
  },
  update: (msg: string, panelNotify: PanelNotificationsType, id: string) => {
    setNotificationState(panelNotify);
    return chrome.notifications.update(id, {
      title: 'Word Salad Sifter',
      message: msg,
      iconUrl: chrome.runtime.getURL('./images/icon128.png'),
      type: 'basic',
      requireInteraction: true,
    });
  },
  error: (msg: string, id: string) => {
    setNotificationState('error');
    return chrome.notifications.create(`${id}-error`, {
      title: 'Word Salad Sifter',
      message: msg,
      iconUrl: chrome.runtime.getURL('./images/icon128.png'),
      type: 'basic',
      requireInteraction: false,
    });
  },
  panelOnly: (panelNotify: PanelNotificationsType) => {
    setNotificationState(panelNotify);
  },
  clear: (id: string) => {
    setNotificationState('close');
    return chrome.notifications.clear(id);
  }
};
