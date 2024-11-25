import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import "./style/mainStyle.scss";
import { getSetAuth } from "./background_auth";
import TextInput from './ui/TextInput';
import Footer from './ui/Footer';
import TemplateModule from './ui/TemplateModule';
import SiftAction from './ui/SiftAction';
import { validateAnthropicApiKey } from './background_llmProcessing';
import useNotifications from './components/hooks/useNotifications';
import NoApiModule from './ui/NoApiModule';
import PanelNotifications from './ui/PanelNotifications';
import { PanelNotificationsType } from './types';
import LoadingWait from './ui/LoadingWait';
import { motion, AnimatePresence, Variants } from 'framer-motion';

export default function Popup() {
  const newFilenameRef = useRef<HTMLInputElement>(null);
  const [newFilename, setNewFilename] = useState<string>('');
  const [hasApiKey, setHasApiKey] = useState<boolean | undefined>(undefined);
  const [hasTemplateId, setHasTemplateId] = useState<boolean>(false);
  const [hasTextCaptured, setHasTextCaptured] = useState<boolean>(false);
  const [autoOpenDoc, setAutoOpenDoc] = useState<boolean>(true);
  const [notifyText, setNotifyText] = useState<PanelNotificationsType | null>(null);
  const footerRef = useRef(null);

  // hook to pull notification passed through session messaging
  useNotifications(setNotifyText);

  const isValidApiKey = async (anthropicApiKey: string) => {
    const isValid = await validateAnthropicApiKey(anthropicApiKey);
    if (isValid) {
      return true;
    }
    // if no api key or if invalid the the Settings sheet will open
    if (footerRef.current) footerRef.current.openApiSheet();
    return false;
  };

  /* Check Google identity */
  useEffect(() => {
    getSetAuth();
  }, []);

  useEffect(() => {
    const handleStorageChange = (changes, nameSpace) => {
      if (changes.highlightedText) {
        // We're saying: if changes.highlightedText is pinged check to see if highlightedText.newValue exists 
        // if it does evaluate length else return false (no newValue key exists)
        const value = ('newValue' in changes.highlightedText) ? changes.highlightedText.newValue.length > 0 : false;
        setHasTextCaptured(value);
      }

      if (changes.templateId) {
        // console.log("HAS CHANGE", changes.templateId.newValue.length, changes.templateId.newValue);
        setHasTemplateId(changes.templateId.newValue.length > 0);
      }
    };

    const checkLocalStorage = () => {
      chrome.storage.session.get('highlightedText', function (result) {
        if (result.highlightedText) {
          if (result.highlightedText.length > 10) {
            setHasTextCaptured(true);
          }
        }
      });
      chrome.storage.local.get(['anthropicApiKey', 'templateId', 'autoOpenDoc'], function (result) {
        isValidApiKey(result.anthropicApiKey)
          .then((isValid) => setHasApiKey(isValid))
          .catch(() => setHasApiKey(false));
        if (result.templateId) {
          setHasTemplateId(true);
        }
        if (result.autoOpenDoc) {
          setAutoOpenDoc(result.autoOpenDoc);
        }
      });
    };
    chrome.storage.onChanged.addListener(function (changes, nameSpace) {
      handleStorageChange(changes, nameSpace);
    });

    // We delaying the check api check so it's not abrupt.
    const timeOut: number = window.setTimeout(() => checkLocalStorage(), 400);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
      clearTimeout(timeOut);
    };
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ autoOpenDoc: autoOpenDoc });
  }, [autoOpenDoc]);

  // Test for panel notification 
  // useEffect(() => {
  // const notifyArray: PanelNotificationsType[] = ['zero', 'one', 'two', 'three', 'four'];
  //   let i = 0;
  //   function loop() {
  //     setTimeout(function () {
  //       setNotifyText(notifyArray[i]);
  //       i += 1;
  //       if (i < notifyArray.length) {
  //         loop();
  //       }
  //     }, 3000);
  //   }
  //   loop();
  // }, []);

  /* Handler to initiate the action while the panel is open */
  const onSiftClick = async () => {
    const { templateId } = await chrome.storage.local.get(['templateId']);
    const { highlightedText } = await chrome.storage.session.get(['highlightedText']);

    chrome.runtime.sendMessage({
      action: 'processHighlightedText',
      data: {
        selection: highlightedText,
        templateId,
        newFilename: newFilename
      }
    });
    if (newFilenameRef.current) newFilenameRef.current.value = '';
    setNewFilename('');
  };

  const handleNewFileNameUpdate = () => {
    if (newFilenameRef.current) {
      const docFilename = newFilenameRef.current.value.trim() || '';
      setNewFilename(docFilename);
    }
  };

  // console.log({ hasApiKey, hasTemplateId, hasTextCaptured });

  const animationVariant: Variants = {
    hidden: {
      opacity: 0,
      y: 2
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        ease: [0.33, 1, 0.68, 1],
        duration: 1,
      }
    },
    exit: {
      opacity: 0,
      y: 2,
      transition: {
        ease: [0.32, 0, 0.67, 0],
        duration: 1,
      },
    }
  };

  return (
    <div className="main_module">
      <PanelNotifications stage={notifyText} />
      <AnimatePresence mode="wait">
        {/* If we don't know if API exists */}
        {hasApiKey === undefined && (
          <motion.div
            key="api-undefined"
            variants={animationVariant}
            initial="hidden"
            animate="show"
            exit="exit"
            className="main_module-loading_wait"><LoadingWait /></motion.div>
        )}
        {/* If there's no associated API Key */}
        {hasApiKey === false && (
          <motion.div
            key="api-does-not-exist"
            variants={animationVariant}
            initial="hidden"
            animate="show"
            exit="exit"
          ><NoApiModule setHasApiKey={setHasApiKey} /></motion.div>
        )}
        {/* If there's an API Key in memory */}
        {hasApiKey === true && (
          <motion.div
            key="api-exists"
            variants={animationVariant}
            initial="hidden"
            animate="show"
            exit="exit"
            className="main_module-interior">
            <TemplateModule />
            <div className="main_module-footer">
              <div className="main_module-sift_wrapper">
                <TextInput
                  label="New Filename (optional)"
                  type="text"
                  ref={newFilenameRef}
                  onChange={handleNewFileNameUpdate}
                />
                <SiftAction
                  readyToSift={hasApiKey && hasTemplateId && hasTextCaptured}
                  handleSiftClick={onSiftClick}
                  autoOpenToggle={setAutoOpenDoc}
                  isAutoOpen={autoOpenDoc}
                />
              </div>
              <Footer ref={footerRef} setHasApiKey={setHasApiKey} hasApiKey={hasApiKey} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
