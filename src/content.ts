/* eslint-disable @typescript-eslint/no-unused-vars */
// console.log('CONTENT SCRIPT LOADED');
let previousHighlightedText = '';
let timeoutId: string | number | NodeJS.Timeout = null;

function checkSelection() {
  const selection = window.getSelection();
  const currentHighlightedText = selection.toString().trim();

  if (currentHighlightedText && currentHighlightedText !== previousHighlightedText) {
    chrome.runtime.sendMessage({ action: "textHighlighted", text: currentHighlightedText });
  } else if (!currentHighlightedText && previousHighlightedText) {
    chrome.runtime.sendMessage({ action: "textUnhighlighted" });
  }
  previousHighlightedText = currentHighlightedText;
}

document.addEventListener('mouseup', function () {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  timeoutId = setTimeout(checkSelection, 100);
});

document.addEventListener('selectionchange', function () {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  timeoutId = setTimeout(checkSelection, 100);
});

// Called on context menu clicked;
chrome.runtime.onMessage.addListener((request: { action: string; templateId: string; }) => {
  // console.log("Message received in content script:", request);
  const selection = window.getSelection().toString().trim();
  if (request.action === 'word-salad-sifter-context') {
    const templateId = request.templateId;
    // console.log("Sending selection to background script");
    chrome.runtime.sendMessage({
      action: 'processHighlightedText',
      data: {
        selection,
        templateId,
        newFileName: ''
      }
    });
  }
});
