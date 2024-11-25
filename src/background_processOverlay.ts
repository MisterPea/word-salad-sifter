type ProgressIframeType = {
  _iframeIdDivId: string | null,
  _iframeId: string | null,
  _overlayId: string | null,
  initiate: () => void;
  removeElement: (id: string) => void;
};

export const progressIframe: ProgressIframeType = {
  _iframeIdDivId: null,
  _iframeId: null,
  _overlayId: null,
  initiate: function () {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) return;

      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: () => {
            let iframeDiv = document.getElementById('word_salad_sifter-iframe-div') as HTMLDivElement | null;
            let iframe = document.getElementById('word_salad_sifter-iframe') as HTMLIFrameElement | null;
            let overlay = document.getElementById('word_salad-overlay') as HTMLDivElement | null;

            if (!iframeDiv && !iframe) {
              iframeDiv = document.createElement('div');
              iframeDiv.id = 'word_salad_sifter-iframe-div';
              iframeDiv.style.cssText = `
              position: fixed;
              top: 0;
              left: 0;
              inset: 0;
              width: 100vw;
              height: 100vh;
              border: none;
              display: block;
              z-index: 2147483646;
              opacity: 1;
              transition: opacity 500ms ease;
              pointer-events: none;
            `;

              iframe = document.createElement("iframe");
              iframe.id = 'word_salad_sifter-iframe';
              iframe.src = chrome.runtime.getURL("processPanel_Index.html");
              iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
              iframe.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                inset: 0;
                width: 100vw;
                height: 100vh;
                border: none;
                display: block;
                z-index: 2147483646;
                background-color: transparent;
                pointer-events: none;
              `;
              iframeDiv.appendChild(iframe);
              document.body.appendChild(iframeDiv);
            }

            if (!overlay) {
              overlay = document.createElement("div");
              overlay.id = 'word_salad-overlay';
              overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background-color: rgba(0, 0, 0, 0);
                z-index: 2147483645;
                pointer-events: all;
              `;
              document.body.appendChild(overlay);
            }

            return { iframeDivId: iframeDiv.id, iframeId: iframe.id, overlayId: overlay.id };
          },
        },
        (results) => {
          if (results && results[0]?.result) {
            const { iframeId, overlayId, iframeDivId } = results[0].result;
            this._iframeId = iframeId;
            this._overlayId = overlayId;
            this._iframeIdDivId = iframeDivId;
          }
        }
      );
    });
  },
  removeElement: function (id) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log("TABS:",tabs)
      if (!tabs[0]?.id) {
        console.error("No active tab found.");
        return;
      }

      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: (elementId) => {
            const elementRef = document.getElementById(elementId);
            if (elementRef && elementId === 'word_salad_sifter-iframe-div') {
              const iframeRef = document.getElementById('word_salad_sifter-iframe')
              elementRef.addEventListener('transitionend', () => {
                elementRef.remove();
                iframeRef.remove()
              }, { once: true });
              (elementRef as HTMLDivElement).style.opacity = '0';
            } else if (elementRef) {
              elementRef.remove();
              // console.log(`Element with ID '${elementId}' removed.`);
            } else {
              console.warn(`Element with ID '${elementId}' not found.`);
            }
          },
          args: [id], // Pass the ID as an argument
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error(`Failed to execute script: ${chrome.runtime.lastError.message}`);
          } else {
            console.log(`Script executed to remove element with ID '${id}'.`);
          }
        }
      );
    });
  },
};