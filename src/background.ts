import { getSetAuth } from "./background_auth";
import { processHighlightedText } from "./background_processHighlightedText";
import processOverlay from "./background_processOverlay";

// setting side panel deployment
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// context menu setup
chrome.runtime.onInstalled.addListener(() => {
  updateContextMenu(false); // initially the context menu will not be active
});

// Check storage on change 
chrome.storage.onChanged.addListener((changes) => {
  if (changes.anthropicApiKey || changes.templateId || changes.highlightedText) {
    // Fetch all required data from storage
    Promise.all([
      chrome.storage.local.get(['anthropicApiKey', 'templateId']),
      chrome.storage.session.get('highlightedText')
    ]).then(([local, session]) => {
      const anthropicApiKey = local.anthropicApiKey;
      const templateId = local.templateId;
      const highlightedText = session.highlightedText;
      // Validate all fields      
      let enableContextMenu = false;
      if ((highlightedText && highlightedText.length > 10) && anthropicApiKey !== undefined && (templateId && templateId.length > 0)) {
        enableContextMenu = true;
      }
      // This exists in background.js - to allow usage with contextMenu
      updateContextMenu(enableContextMenu);

    });
  }
});

// context button click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'word-salad-sifter-context') {
    chrome.storage.local.get(['templateId'], function (result) {
      const templateId = result.templateId || '';
      chrome.tabs.sendMessage(tab.id, { action: "word-salad-sifter-context", templateId });
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "textUnhighlighted":
      chrome.storage.session.set({ highlightedText: '' });
      chrome.storage.session.set({ tabId: null });
      chrome.storage.session.set({ windowId: null });
      break;
    case "textHighlighted":
      chrome.storage.session.set({ highlightedText: request.text });
      // we are preserving the tabId when we highlight text 
      chrome.storage.session.set({ tabId: sender.tab.id });
      chrome.windows.getCurrent()
        .then(({ id }) => chrome.storage.session.set({ windowId: id }));
      break;
    case "getAuthToken":
      getSetAuth()
        .then((token) => sendResponse({ token: token }))
        .catch((error) => sendResponse({ error: error.message }));
      return true; // send response asynchronously 
    case "processHighlightedText":
      processHighlightedText(request.data.selection, request.data.templateId, request.data.newFilename)
        .then((result) => {
          // console.log(result);
          sendResponse({ success: true, data: result });
        })
        .catch((error) => {
          console.error('Error processing text:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true;
  }
  return true;
});

// We enable/disable context menu here
export function updateContextMenu(isEnabled: boolean = false) {
  chrome.contextMenus.update("word-salad-sifter-context", {
    enabled: isEnabled
  }, () => {
    if (chrome.runtime.lastError) {
      // If the menu doesn't exist yet, create it
      chrome.contextMenus.create({
        id: "word-salad-sifter-context",
        title: "Sift Some Word Salad",
        contexts: ['all'],
        enabled: isEnabled
      });
    }
  });
}
// chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
//   if (changeInfo.status == 'complete') {
//     processOverlay()
//   }
// })