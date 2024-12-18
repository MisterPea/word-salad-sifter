// Auth - Moved from src/components/getSetAuth.ts
/**
 * This function performs double-duty. It checks for an auth token, if none is available it'll
 * prompt the user. If one is available it'll return it. 
 * Additionally there is a timer to refresh if expiry has passed
 */
export function getSetAuth() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['authToken', 'tokenExpiry'], function (result: { authToken: string; tokenExpiry: number; }) {
      const now = Date.now();
      if (result.authToken && result.tokenExpiry && now < result.tokenExpiry) {
        // Token exists and is not expired
        resolve(result.authToken);
      } else {
        // Token doesn't exist or is expired, get a new one
        chrome.identity.getAuthToken({ interactive: true }, function (token: string) {
          if (chrome.runtime.lastError) {
            // Handle need to login new user.
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          // Store the new token with an expiry time (e.g., 1 hour from now)
          const expiry = Date.now() + 3600000; // 1 hour in milliseconds
          chrome.storage.local.set({ 'authToken': token, 'tokenExpiry': expiry }, function () {
            resolve(token);
          });
        });
      }
    });
  });
}

export async function logout() {
  await chrome.storage.local.clear();
  chrome.identity.getAuthToken({ interactive: false }, async function (authToken: string) {
    if (!chrome.runtime.lastError) {
      try {
        const revokeURL = `https://accounts.google.com/o/oauth2/revoke?token=${authToken}`;
        chrome.identity.removeCachedAuthToken({ token: authToken }, function () { });
        await fetch(revokeURL);
        // Logout Success
      } catch (error) {
        console.error("Logout Error", error);
      }
    }
  });
}
