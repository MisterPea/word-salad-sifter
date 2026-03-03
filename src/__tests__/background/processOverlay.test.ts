import { progressIframe } from '../../background/background_processOverlay';
import { resetChromeMock } from '../testUtils/mockChrome';

describe('progressIframe', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    progressIframe._iframeIdDivId = null;
    progressIframe._iframeId = null;
    progressIframe._overlayId = null;

    resetChromeMock();
    chrome.tabs.query = jest.fn();
    chrome.scripting.executeScript = jest.fn();
    chrome.runtime.getURL = jest.fn((path: string) => path);
    chrome.runtime.lastError = undefined;
  });

  function mockExecuteScript() {
    (chrome.scripting.executeScript as jest.Mock).mockImplementation(({ func, args }: { func: (...input: string[]) => unknown; args?: string[]; }, callback?: (results: Array<{ result: unknown; }>) => void) => {
      const result = func(...(args || []));
      callback?.([{ result }]);
    });
  }

  test('initiate creates the iframe and blocking overlay once', () => {
    (chrome.tabs.query as jest.Mock).mockImplementation((_query: unknown, callback: (tabs: Array<{ id: number; }>) => void) => callback([{ id: 7 }]));
    mockExecuteScript();

    progressIframe.initiate();
    progressIframe.initiate();

    expect(document.getElementById('word_salad_sifter-iframe-div')).not.toBeNull();
    expect(document.getElementById('word_salad_sifter-iframe')).not.toBeNull();
    expect(document.getElementById('word_salad-overlay')).not.toBeNull();
    expect(document.querySelectorAll('#word_salad_sifter-iframe-div')).toHaveLength(1);
    expect(document.querySelectorAll('#word_salad-overlay')).toHaveLength(1);
  });

  test('teardown removes both elements and resets tracked ids', () => {
    (chrome.tabs.query as jest.Mock).mockImplementation((_query: unknown, callback: (tabs: Array<{ id: number; }>) => void) => callback([{ id: 7 }]));
    mockExecuteScript();

    progressIframe.initiate();
    progressIframe.teardown();

    const iframeDiv = document.getElementById('word_salad_sifter-iframe-div') as HTMLDivElement;
    iframeDiv.dispatchEvent(new Event('transitionend'));

    expect(document.getElementById('word_salad_sifter-iframe-div')).toBeNull();
    expect(document.getElementById('word_salad-overlay')).toBeNull();
    expect(progressIframe._iframeIdDivId).toBeNull();
    expect(progressIframe._iframeId).toBeNull();
    expect(progressIframe._overlayId).toBeNull();
  });

  test('teardown is safe when tracked elements are missing', () => {
    (chrome.tabs.query as jest.Mock).mockImplementation((_query: unknown, callback: (tabs: Array<{ id: number; }>) => void) => callback([{ id: 7 }]));
    mockExecuteScript();

    expect(() => progressIframe.teardown()).not.toThrow();
  });

  test('removeElement handles missing active tab without throwing', () => {
    (chrome.tabs.query as jest.Mock).mockImplementation((_query: unknown, callback: (tabs: never[]) => void) => callback([]));

    expect(() => progressIframe.removeElement('word_salad-overlay')).not.toThrow();
    expect(chrome.scripting.executeScript).not.toHaveBeenCalled();
  });
});
