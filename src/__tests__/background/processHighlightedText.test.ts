import { processHighlightedText } from '../../background/background_processHighlightedText';
import { BackgroundError } from '../../background/background_errors';
import { resetChromeMock } from '../testUtils/mockChrome';

jest.mock('../../components/_tableFunctions', () => ({
  _createJobDescriptionTable: jest.fn(() => [{ insertText: { text: 'table', location: { index: 1 } } }]),
  populateTable: jest.fn(() => [{ insertText: { text: 'content', location: { index: 3 } } }]),
  findInsertionIndexAfterTable: jest.fn(() => 12),
}));

jest.mock('../../background/background_llmProcessing', () => ({
  llmJobDescriptionProcessing: jest.fn(),
}));

jest.mock('../../components/_parseJobDescription', () => ({
  _parseJobDescription: jest.fn(() => ({
    'Company Name': '- Acme',
    'Job Title': '- Engineer',
  })),
}));

jest.mock('../../background/background_apiCalls', () => ({
  batchUpdate: jest.fn(),
  cloneDocument: jest.fn(),
  deleteDocument: jest.fn(),
  getDocument: jest.fn(),
  renameDocument: jest.fn(),
}));

jest.mock('../../background/background_notifications', () => ({
  notifications: {
    id: jest.fn(() => 'note-123'),
    make: jest.fn(),
    update: jest.fn(),
    clear: jest.fn(),
    error: jest.fn(),
    panelOnly: jest.fn(),
  },
}));

jest.mock('../../background/background_processOverlay', () => ({
  progressIframe: {
    initiate: jest.fn(),
    teardown: jest.fn(),
  },
}));

const { llmJobDescriptionProcessing } = jest.requireMock('../../background/background_llmProcessing');
const apiCalls = jest.requireMock('../../background/background_apiCalls');
const { notifications } = jest.requireMock('../../background/background_notifications');
const { progressIframe } = jest.requireMock('../../background/background_processOverlay');

describe('processHighlightedText', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    resetChromeMock();

    chrome.runtime.getContexts = jest.fn((_query: unknown, callback: (contexts: never[]) => void) => callback([]));
    chrome.storage.local.get = jest.fn((_keys: unknown, callback: (result: { autoOpenDoc: boolean; }) => void) => callback({ autoOpenDoc: true }));
    chrome.storage.local.set = jest.fn((_value: unknown, callback?: () => void) => callback?.());
    chrome.storage.session.clear = jest.fn();
    chrome.storage.session.get = jest.fn((_keys: unknown, callback: (result: { tabId: number; windowId: number; }) => void) => callback({ tabId: 10, windowId: 20 }));
    chrome.tabs.query = jest.fn((_query: unknown, callback: (tabs: Array<{ id: number; url: string; }>) => void) => callback([{ id: 99, url: 'https://jobs.example.com/123' }]));
    chrome.tabs.create = jest.fn();
    chrome.windows.update = jest.fn((_windowId: unknown, _updateInfo: unknown, callback?: () => void) => callback?.());
    chrome.windows.create = jest.fn();
    chrome.scripting.executeScript = jest.fn(() => Promise.resolve());
    chrome.notifications.clear = jest.fn();
    chrome.notifications.create = jest.fn();
    chrome.notifications.update = jest.fn();

    apiCalls.cloneDocument.mockResolvedValue({ id: 'doc-123' });
    apiCalls.batchUpdate.mockResolvedValue(undefined);
    apiCalls.renameDocument.mockResolvedValue(undefined);
    apiCalls.getDocument.mockResolvedValue({ body: {} });
    apiCalls.deleteDocument.mockResolvedValue(undefined);
    llmJobDescriptionProcessing.mockResolvedValue('parsed llm text');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('completes successfully and delays overlay teardown for completion animation', async () => {
    await processHighlightedText('sample highlighted text', 'template-1', 'Custom Name');

    expect(progressIframe.initiate).toHaveBeenCalledTimes(1);
    expect(apiCalls.cloneDocument).toHaveBeenCalledWith('template-1');
    expect(llmJobDescriptionProcessing).toHaveBeenCalledWith('sample highlighted text');
    expect(apiCalls.renameDocument).toHaveBeenCalledWith('doc-123', 'Custom Name');
    expect(notifications.panelOnly).toHaveBeenCalledWith('four');
    expect(progressIframe.teardown).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1500);

    expect(progressIframe.teardown).toHaveBeenCalledTimes(1);
    expect(notifications.panelOnly).toHaveBeenLastCalledWith('hidden');
    expect(chrome.tabs.create).toHaveBeenCalledWith({ url: 'https://docs.google.com/document/d/doc-123/edit' });
  });

  test('deletes cloned doc and tears down overlay on llm failure', async () => {
    llmJobDescriptionProcessing.mockRejectedValue(new Error('llm exploded'));

    await processHighlightedText('sample highlighted text', 'template-1', '');

    expect(apiCalls.deleteDocument).toHaveBeenCalledWith('doc-123');
    expect(notifications.error).toHaveBeenCalledWith(`There's been an error: Now Deleting Cloned Document`, 'note-123');
    expect(progressIframe.teardown).toHaveBeenCalledTimes(1);
    expect(notifications.panelOnly).toHaveBeenLastCalledWith('hidden');
  });

  test('does not delete a document when clone fails before an id exists', async () => {
    apiCalls.cloneDocument.mockRejectedValue(new BackgroundError('GOOGLE_DOC_NOT_FOUND', 'missing template', { status: 404 }));

    await processHighlightedText('sample highlighted text', 'template-1', '');

    expect(apiCalls.deleteDocument).not.toHaveBeenCalled();
    expect(progressIframe.teardown).toHaveBeenCalledTimes(1);
    expect(chrome.windows.create).toHaveBeenCalledWith(expect.objectContaining({ url: 'popupMissingApi.html' }));
  });

  test('treats parse errors as general failures and still cleans up', async () => {
    const { _parseJobDescription } = jest.requireMock('../../components/_parseJobDescription');
    _parseJobDescription.mockImplementationOnce(() => {
      throw new Error('bad parse');
    });

    await processHighlightedText('sample highlighted text', 'template-1', '');

    expect(apiCalls.deleteDocument).toHaveBeenCalledWith('doc-123');
    expect(progressIframe.teardown).toHaveBeenCalledTimes(1);
    expect(chrome.windows.create).toHaveBeenCalledWith(expect.objectContaining({ url: 'popupMissingApi.html' }));
  });

  test('routes anthropic auth failures to the anthropic handler and still cleans up', async () => {
    llmJobDescriptionProcessing.mockRejectedValue(new BackgroundError('ANTHROPIC_AUTH', 'bad key', { status: 401 }));

    await processHighlightedText('sample highlighted text', 'template-1', '');

    expect(apiCalls.deleteDocument).toHaveBeenCalledWith('doc-123');
    expect(progressIframe.teardown).toHaveBeenCalledTimes(1);
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ errorType: { type: 'bad_anthropic_key' } }, expect.any(Function));
  });
});
