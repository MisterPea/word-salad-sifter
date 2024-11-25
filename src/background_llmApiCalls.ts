export function getApiKey(): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['anthropicApiKey'], function (result) {
      if (result) {
        resolve(result.anthropicApiKey);
      } else {
        reject(new Error('Error Retrieving Anthropic API Key'));
      }
    });
  });
}