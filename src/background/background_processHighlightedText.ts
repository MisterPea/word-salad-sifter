import { _createJobDescriptionTable, populateTable, findInsertionIndexAfterTable } from "../components/_tableFunctions";
import { llmJobDescriptionProcessing } from "./background_llmProcessing";
import { _parseJobDescription } from "../components/_parseJobDescription";
import { batchUpdate, cloneDocument, deleteDocument, getDocument, renameDocument } from "./background_apiCalls";
import { notifications } from "./background_notifications";
import { progressIframe } from "./background_processOverlay";
import { toBackgroundError } from "./background_errors";

type AutoOpenResult = {
  autoOpenDoc?: boolean;
};

type UrlTab = {
  url?: string;
};

type StoredWindowSelection = {
  tabId?: number | null;
  windowId?: number | null;
};

type RuntimeContextView = Record<string, unknown>;

/**
 * Function that handles the processing and orchestration of api calls and document writes
 * @param {string} text Text that's been highlighted
 * @param {string} templateId Google Doc template id
 * @param {string} newFilename Optional file name for cloned Google Doc
 */
export async function processHighlightedText(text: string, templateId: string, newFilename: string) {

  /**
   * Function to look at jobDescriptionObject and find the company name and/or job title
   * @param jobDescriptionObject 
   * @returns 
   */
  function findJobTitle(jobDescriptionObject: { [x: string]: string; }) {
    const keys = Object.keys(jobDescriptionObject);
    let company: string = '';
    let jobTitle: string = '';
    for (let i = 0; i < keys.length; i += 1) {
      if (keys[i] === 'Company Name') {
        company = jobDescriptionObject[keys[i]];
        company = company.replace('- ', '');
      }
      if (keys[i] === 'Job Title') {
        jobTitle = jobDescriptionObject[keys[i]];
        jobTitle = jobTitle.replace('- ', '');
      }
      if (company.length > 0 && jobTitle.length > 0) {
        break;
      }
    }
    if (company.length === 0 && jobTitle.length === 0) {
      company = 'New-Resume';
      jobTitle = `${Math.random().toString(36).substring(2, 8)}`;
    }
    return `${company}-${jobTitle}`;
  }

  function scheduleSuccessTeardown(documentId: string) {
    setTimeout(() => {
      progressIframe.teardown();
      notifications.panelOnly('hidden');
      chrome.storage.local.get(['autoOpenDoc'], function (result: AutoOpenResult) {
        if (result.autoOpenDoc === true) {
          chrome.tabs.create({ url: `https://docs.google.com/document/d/${documentId}/edit` });
        }
      });
    }, 1500);
  }

  function classifyError(error: unknown) {
    const backgroundError = toBackgroundError(error);
    switch (backgroundError.code) {
      case 'GOOGLE_DOC_NOT_FOUND':
        return { type: 'google-doc' as const, error: backgroundError };
      case 'API_KEY_NOT_PRESENT':
      case 'ANTHROPIC_AUTH':
        return { type: 'anthropic' as const, error: backgroundError };
      default:
        return { type: 'general' as const, error: backgroundError };
    }
  }

  const notificationId = notifications.id();

  function getUrl(): Promise<undefined | string> {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs: UrlTab[]) {
        if (tabs && tabs[0]) {
          resolve(tabs[0].url);
        } else {
          resolve(undefined);
        }
      });
    });
  }

  // ************************************************************* //
  // **** This try block is the orchestrator of the processes **** //
  // ************************************************************* //
  let newDocumentId: string | undefined = undefined;
  let shouldDelayTeardown = false;
  let successfulDocumentId: string | null = null;
  try {
    const strTotal = text.length;
    /* 
    The time estimate is a logarithmic curve - it's actual value is hard to know
    as the time to process is based network condition and unknowable circumstances 
    Updated in `Update-LLM-Version` commit. New model seems to take a bit longer to process info
    */
    const estimatedTime = ((0.00151 * strTotal) + 14.17) * 0.65;

    // Initiate overlay
    progressIframe.initiate();

    notifications.panelOnly('zero');
    notifications.make('Cloning Document', 'one', estimatedTime, notificationId);
    const { id } = await cloneDocument(templateId);
    newDocumentId = id;
    const currentUrl = await getUrl();

    notifications.update(`Processing Text via LLM - Approx: ${Math.round(estimatedTime)}`, 'two', notificationId);
    const jobDescription = await llmJobDescriptionProcessing(text);

    const jobDescriptionObject = _parseJobDescription(jobDescription, currentUrl);
    const replacementTable = _createJobDescriptionTable(jobDescriptionObject);

    await batchUpdate(id, replacementTable);

    // check for fileName - if none - generate one
    const googleDocFilename = newFilename || findJobTitle(jobDescriptionObject);
    notifications.update('Building Google Document', 'three', notificationId);
    await renameDocument(id, googleDocFilename);

    // Check insertion point of text into table
    const newDocument = await getDocument(id);
    const insertionIndex = findInsertionIndexAfterTable(newDocument);

    // Build and update table content
    const populatedTable = populateTable(jobDescriptionObject, insertionIndex);
    await batchUpdate(id, populatedTable);

    // Open newly created document
    notifications.clear(notificationId);
    notifications.panelOnly('four');
    shouldDelayTeardown = true;
    successfulDocumentId = id;

    // Clearing the selected
    const activeWindow: { tabId: number | null, windowId: number | null; } = { tabId: null, windowId: null };
    chrome.storage.session.get(['tabId', 'windowId'], function (data: StoredWindowSelection) {
      if (data.tabId && data.windowId) {
        activeWindow.tabId = data.tabId;
        activeWindow.windowId = data.windowId;
        chrome.storage.session.clear();
        // Update the window
        chrome.windows.update(activeWindow.windowId, { focused: false }, function () {
          // Clear the highlighted text after we select the window, then the tab
          // This info is being written when we highlight the text
          chrome.scripting.executeScript({
            target: { tabId: activeWindow.tabId },
            func: clearSelection
          })
            .catch(() => {
              chrome.storage.session.clear();
              // Fail silently: do nothing here
              // The tab probably doesn't exist anymore
            });
        });
      }
    });
    // We no longer need tabId, windowId, or highlighted text


  } catch (error) {
    const classifiedError = classifyError(error);

    if (classifiedError.type === 'google-doc') {
      await handleGoogleDocError();
    } else if (classifiedError.type === 'anthropic') {
      await handleAnthropicError();
    } else {
      await handleGeneralError();
    }

    await notifications.clear(notificationId);
    notifications.error(`There's been an error: Now Deleting Cloned Document`, notificationId);
    notifications.panelOnly('hidden');

    if (newDocumentId) {
      try {
        await deleteDocument(newDocumentId);
      } catch (deleteError) {
        console.error('Failed to delete cloned document after processing error.', deleteError);
      }
    }
  } finally {
    chrome.storage.session.clear();
    if (shouldDelayTeardown && successfulDocumentId) {
      scheduleSuccessTeardown(successfulDocumentId);
    } else {
      progressIframe.teardown();
      notifications.panelOnly('hidden');
    }
  }
}

// This is being called to clear the text
function clearSelection() {
  if (window.getSelection) {
    window.getSelection().removeAllRanges();
  }
}


/* *************************************** Error Handling *************************************** */
async function handleGoogleDocError() {
  // console.log('BAD_GOOGLE_DOCS_DOCUMENT_ADDRESS');
  const sidePanelDeployed = await panelIsDeployed();
  if (sidePanelDeployed) {
    // console.log('focus side panel');
  } else {
    chrome.storage.local.set({ errorType: { type: 'bad_google_doc_address' } }, function () {
      chrome.windows.create({
        url: 'popupMissingApi.html',
        type: 'popup',
        width: 500,
        height: 400,
      });
    });
  }
}

async function handleAnthropicError() {
  // console.log('BAD_ANTHROPIC_KEY');
  const sidePanelDeployed = await panelIsDeployed();
  if (sidePanelDeployed) {
    handleErrorOnPanel('badAnthropicKey');
  } else {
    chrome.storage.local.set({ errorType: { type: 'bad_anthropic_key' } }, function () {
      chrome.windows.create({
        url: 'popupMissingApi.html',
        type: 'popup',
        width: 500,
        height: 400,
      });
    });
  }
}

async function handleGeneralError() {
  // console.log('GENERAL ERROR');
  const sidePanelDeployed = await panelIsDeployed();
  if (sidePanelDeployed) {
    // console.log('focus side panel');
  } else {
    chrome.storage.local.set({ errorType: { type: 'general_error' } }, function () {
      chrome.windows.create({
        url: 'popupMissingApi.html',
        type: 'popup',
        width: 500,
        height: 400,
      });
    });
  }
}

/**
 * Function to test whether the side panel is deployed: true === deployed
 */
function panelIsDeployed(): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.runtime.getContexts({ contextTypes: [chrome.runtime.ContextType.SIDE_PANEL] }, function (views: RuntimeContextView[]) {
      resolve(views.length > 0);
    });
  });
}


function handleErrorOnPanel(errorLocation: string) {
  chrome.runtime.sendMessage({ action: "hasError", data: errorLocation }, function () { });
}
