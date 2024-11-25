import { useEffect } from "react";
import { PanelNotificationsType } from "../../types";

export default function useNotifications(setNotifyText: React.Dispatch<React.SetStateAction<PanelNotificationsType>>, setEstimatedTime: React.Dispatch<React.SetStateAction<number>>) {
  useEffect(() => {
    // Function to read from storage
    const getNotifyText = () => {
      chrome.storage.session.get(['notifyText', 'estimatedTime'], (result) => {
        if (result.notifyText) {
          setNotifyText(result.notifyText);
        }
        if (result.estimatedTime) {
          setEstimatedTime(result.estimatedTime);
        }
      });
    };

    // Read initial value
    getNotifyText();

    // Set up listener for changes
    const listener = (changes, namespace: 'session' | string) => {
      if (namespace === 'session' && changes.notifyText) {
        // Filtering for noise from main notifications
        if (changes.notifyText.newValue !== undefined && changes.notifyText.newValue !== 'close') {
          setNotifyText(changes.notifyText.newValue);
        }
        if (changes.estimatedTime && changes.estimatedTime.newValue !== undefined && changes.estimatedTime.newValue !== null) {
          setEstimatedTime(changes.estimatedTime.newValue);
        }
      }
    };

    chrome.storage.onChanged.addListener(listener);

    // Cleanup listener on unmount
    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);
}