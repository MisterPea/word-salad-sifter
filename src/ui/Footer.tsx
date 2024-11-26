import * as React from 'react';
import { useState, useRef, forwardRef, useImperativeHandle, Ref } from 'react';
import CircleIconButton from './CircleIconButton';
import PillButton from './PillButton';
import { Icon } from './Icons';
import TextInput from './TextInput';
import { validateAnthropicApiKey } from '../background/background_llmProcessing';
import { logout } from '../background/background_auth';


interface FooterProps {
  setHasApiKey: React.Dispatch<React.SetStateAction<boolean>>;
  hasApiKey: boolean;
}

const Footer = forwardRef((props: FooterProps, ref: Ref<{ openApiSheet: () => void; }>) => {
  const { setHasApiKey, hasApiKey } = props;
  const [footerDialogue, setFooterDialogue] = useState<'help' | 'api' | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [apiKeyError, setApiKeyError] = useState<string>('');
  const [isValidatingApiKey, setIsValidatingApiKey] = useState<boolean>(false);
  const [forcedOpen, setForcedOpen] = useState<boolean>(false);
  const apiInputRef = useRef<HTMLInputElement>(null);
  const lowerApiPanelDeployed = useRef<boolean>(false);
  const lowerHelpPanelDeployed = useRef<boolean>(false);

  useImperativeHandle(ref, () => ({
    openApiSheet: () => {
      setFooterDialogue('api');
      setForcedOpen(true);
    }
  }));

  const handleSignOutClick = async () => {
    const executeLogout = window.confirm("Signing out will log you out and delete saved templates. Are you sure you wish to do this?");
    if (executeLogout) {
      try {
        await chrome.storage.local.clear();
        await chrome.storage.sync.clear();
        await chrome.storage.session.clear();
        await logout();
        setHasApiKey(false);
      } catch (error) {
        console.error('The was an issue logging user out:', error);
      }
    }
  };

  const handleDialog = (dialogueName: 'help' | 'api' | null) => {
    if (dialogueName === 'help') {
      lowerHelpPanelDeployed.current = true;
    }
    if (dialogueName === 'api') {
      lowerApiPanelDeployed.current = true;
    }
    setFooterDialogue(dialogueName);
  };

  const onInputChange = () => {
    setApiKeyError('');
    if (apiInputRef.current) {
      setApiKey(apiInputRef.current.value);
    }
  };

  const onInputCancelClick = () => {
    if (apiInputRef.current) {
      apiInputRef.current.value = '';
    }
    setFooterDialogue(null);
  };

  const onInputSubmit = async () => {
    setIsValidatingApiKey(true);
    try {
      const isValid = await validateAnthropicApiKey(apiKey);
      if (isValid) {
        await chrome.storage.local.set({ anthropicApiKey: apiKey });
        onInputCancelClick();
      } else {
        setApiKeyError('Invalid Anthropic API key');
      }
    } catch (error) {
      setApiKeyError('Error validating API key');
    }
    setIsValidatingApiKey(false);
  };

  return (
    <>
      {/* API Dialogue */}
      {/* Nested ternary is not good - it should be fixed! */}
      <div className={`footer_overlay-inner${footerDialogue === 'api' ? ' active' : (lowerApiPanelDeployed.current === true ? ' inactive' : '')}`}>
        <div className="footer_overlay-title">
          <h3>Settings</h3>
          {!forcedOpen && <button onClick={() => handleDialog(null)} className="footer_overlay-inner-close_btn">
            <Icon.Close />
          </button>}
        </div>
        <ul>
          <li>In order to use this extension, you need to provide a valid Anthropic API Key.</li>
          <li>Don't have one? Get one <a href='https://console.anthropic.com/settings/keys' target="_blank" rel="noreferrer nofollow">here.</a></li>
          <li>Average Token Usage: ~1500 in — ~500 out (~1.2 cents per document)</li>
        </ul>
        <div className='footer_overlay-input_wrapper'>
          <TextInput
            onChange={onInputChange}
            showSpinner={isValidatingApiKey}
            error={apiKeyError}
            type="password"
            ref={apiInputRef}
            label="Anthropic API Key*"
            placeholder={hasApiKey ? `•••••••••••••••••••••••••••••••••••••••••••••••••••••••` : 'Enter Your Anthropic API Key'}
          />
        </div>
        <div className="footer_overlay-button_wrapper">
          {!forcedOpen && <PillButton callback={onInputCancelClick} label='Cancel' size='small' />}
          <PillButton data-testid="api-submit-button" callback={onInputSubmit} type='primary-dark' label='Submit' size='small' disabled={apiKey.length < 10} />
        </div>
        <div className="footer_overlay-sign_out-wrapper">
          <PillButton type="secondary" label="Sign Out" size="small" callback={handleSignOutClick} className="extension_footer-center" />
        </div>
      </div>
      {/* Help Dialogue */}
      <div className={`footer_overlay-inner${footerDialogue === 'help' ? ' active' : (lowerHelpPanelDeployed.current === true ? ' inactive' : '')}`}>
        <div className="footer_overlay-title">
          <h3>Help</h3>
          <button onClick={() => handleDialog(null)} className="footer_overlay-inner-close_btn">
            <Icon.Close />
          </button>
        </div>
        <ol>
          <li><u>Add a Google Doc resume as your template.</u> Don't have one? Find a starter template <a href="https://drive.google.com/drive/folders/16Nl2GfZy4J0hbTru2FKSpgYO38eQ3pBn?usp=sharing" target="_blank" rel="noopener noreferrer">here</a>.</li>
          <li><u>Select a target document.</u> Consider having multiple templates for different positions.</li>
          <li><u>Selecting job description.</u> Highlight the relevant text in the job posting with your cursor</li>
          <li><u>Parsing</u> Click 'Sift Some Word Salad'. If the side panel is closed, right-click for options and click 'Sift Some Word Salad' there.</li>
          <li><u>Track progress.</u> If you have your Chrome Notifications enabled, you will see updates as the job posting is processed.</li>
        </ol>
        <PillButton callback={() => handleDialog(null)} label='Cancel' size='small' className='footer_overlay-cancel_btn' />
      </div>

      <footer className="extension_footer">
        <CircleIconButton onClick={() => handleDialog('help')} type="help" className="extension_footer-left_icon" />
        <CircleIconButton onClick={() => handleDialog('api')} type="settings" className="extension_footer-right_icon" />
      </footer>
    </>
  );
});

export default Footer;