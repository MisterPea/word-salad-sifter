/* ***************************************************************************************** */
/* ***************************************************************************************** */
/* ***************************************************************************************** */
/* **** This whole doc may not be needed if we present failure notifications elsewhere ***** */
/* ************* It could be as simple as directing the user to the side panel ************* */
/* ***************************************************************************************** */
/* ***************************************************************************************** */
/* ***************************************************************************************** */

const googleDocsBadKey = {
  title: 'Bad Google Docs TemplateId',
  content: `
    <div>
    <h1>Google Doc - Template Id error</h1>
    <h2>It seems you may have entered a non-existent Google Doc Template ID</h2>
    <br><br>
    <label for="error_key_input">Template ID:</label>
  </div>
  `
};

const anthropicBadKey = {
  title: 'Bad API Key',
  content: `
    <div>
    <h1>Enter API Key</h1>
    <h2>You need to enter your Anthropic API Key in order to use this extension.</h2>
    <p>Don't have an API?</p>
    <p>Get one <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer nofollow">here</a></p>
    <br><br>
    <label for="missing_anthropic_api_key">Anthropic API Key:</label>
  </div>
  `
};

const generalError = {
  title: 'General Error',
  content: `
    <div>
    <h1>Extension Error</h1>
    <h2>You've encountered a General Exception</h2>
    <p>This should never happen. Feel free to send us an email with a screenshot of your console and/or any info that lead up to this calamity. We are super appreciative</p>
    <br><br>
    <label for="missing_anthropic_api_key">Anthropic API Key:</label>
  </div>
  `
};

document.addEventListener('DOMContentLoaded', function () {
  const submitButton = document.getElementById('error_submit_input_button');
  const cancelButton = document.getElementById('error_close_input_button');
  const apiKeyInput = document.getElementById('error_key_input') as HTMLInputElement;
  const container = document.getElementById('popup-container');

  chrome.storage.local.get(['errorType'], function (result) {
    if (result.errorType) {
      // console.log(result.errorType);
      const { type } = result.errorType;
      // If Google Doc Error
      if (type === 'bad_google_doc_address') {
        document.title = googleDocsBadKey.title;
        container.innerHTML = googleDocsBadKey.content;
        apiKeyInput.addEventListener('change', function () {
          chrome.storage.local.set({ templateId: apiKeyInput.value });
        });
      }
      // If Anthropic Key Error
      if (type === 'bad_anthropic_key') {
        document.title = anthropicBadKey.title;
        container.innerHTML = anthropicBadKey.content;
        apiKeyInput.addEventListener('change', function () {
          chrome.storage.local.set({ templateId: apiKeyInput.value });
        });
        // If General Error
      } else {
        container.innerHTML = generalError.content;
        document.title = generalError.title;
        apiKeyInput.style.display = 'none';
        submitButton.style.display = 'none';
        cancelButton.style.display = 'none';
      }
    }
  });
});

