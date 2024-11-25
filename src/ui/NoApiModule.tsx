import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import TextInput from './TextInput';
import PillButton from './PillButton';
import { validateAnthropicApiKey } from '../background_llmProcessing';
import { getSetAuth } from '../background_auth';

interface NoApiModuleProps {
  setHasApiKey: React.Dispatch<React.SetStateAction<boolean>>;
}


export default function NoApiModule({ setHasApiKey }: NoApiModuleProps) {
  const [apiKeyError, setApiKeyError] = useState<string>('');
  const [isValidatingApiKey, setIsValidatingApiKey] = useState<boolean>(false);
  const apiInputRef = useRef<HTMLInputElement>(null);
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    getSetAuth();
  }, []);

  const onInputChange = () => {
    setApiKeyError('');
    if (apiInputRef.current) {
      setApiKey(apiInputRef.current.value);
    }
  };

  const onInputSubmit = async () => {
    setIsValidatingApiKey(true);
    try {
      const isValid = await validateAnthropicApiKey(apiKey);
      if (isValid) {
        await chrome.storage.local.set({ anthropicApiKey: apiKey });
        setHasApiKey(true);
      } else {
        setApiKeyError('Invalid Anthropic API key');
      }
    } catch (error) {
      setApiKeyError('Error validating API key');
    }
    setIsValidatingApiKey(false);
  };

  return (
    <div className="main_module-no_api">
      <header className="main_module-no_api-header">
        <img src='/images/icon-349.png' />
        <div className="main_module-no_api-headline_text">
          <h1>Unartful Labs: Word Salad Sifter</h1>
          <h2>Cut to the Heart of What Job Posters Are Looking For</h2>
        </div>
      </header>
      <p><i>Word Salad Sifter</i> lets you easily parse job postings and find all the important information within them.</p>
      <h3>The Setup Process Is Simple:</h3>
      <ol>
        <li><span>Google Login:</span> When prompted, login to the Google account tied to your Google Docs.</li>
        <li><span>Sign-up for access to Anthropic's API:</span>
          <ol>
            <li>Select and fund your plan <a href="https://console.anthropic.com/settings/plans" target="_blank" rel="noopener noreferrer">here</a> ($5.00 will allow you to parse about 400 job postings).</li>
            <li>Once your account is funded, get an API key <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer">here</a>, then enter it below.</li>
          </ol>
        </li>
        <li><span>Add template(s):</span> Use your past resumes created in Google Docs as templates to for Word Salad Sifter. Don't have a resume yet? Find some templates <a href="https://drive.google.com/drive/folders/16Nl2GfZy4J0hbTru2FKSpgYO38eQ3pBn?usp=drive_link" target="_blank" rel="noopener noreferrer">here</a>.</li>
      </ol>

      <h3 className="main_module-no_api-easy_use-header">It's Easy Use:</h3>
      <ol>
        <li>When you find a job posting of interest, highlight the text with your mouse and click <span>Sift Some Word Salad</span> from the side panel or (right-click) context menu.</li>
        <li>A new Google Doc will be created with the pertinent job information added to the top of your document.</li>
      </ol>
      <div className="main_module-no_api-input">
        <div>
          <h3>Enter Your Anthropic API Key:</h3>
          <TextInput
            onChange={onInputChange}
            showSpinner={isValidatingApiKey}
            error={apiKeyError}
            type="password"
            ref={apiInputRef}
            label="Anthropic API Key*"
          />
          <div className="main_module-no_api-input-button_wrapper">
            <PillButton callback={onInputSubmit} type='primary-dark' label='Submit' size='small' disabled={apiKey.length < 10} />
          </div>
        </div>
        <h4 className="main_module-no_api-walkthrough"><a href="https://www.youtube.com/watch?v=BNGwXvL0FuY" target="_blank" rel="noopener noreferrer">Click Here for a Visual Walk-Through</a></h4>
      </div>
    </div >
  );
}