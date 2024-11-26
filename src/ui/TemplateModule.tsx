import * as React from "react";
import {useState, useRef, useEffect} from 'react';
import TextInput from "./TextInput";
import PillButton from "./PillButton";
import {getDocument} from "../background/background_apiCalls";
import {TemplateElement} from "../types";
import TemplateButton from "./TemplateButton";
import {AnimatePresence, motion} from "framer-motion";

export default function AddTemplateModule() {
    const [isCheckingUrl, setIsCheckingGoogleUrl] = useState<boolean>(false);
    const [isDocError, setIsDocError] = useState<string>('');
    const [isTemplateNameError, setIsTemplateNameError] = useState<string>('');
    const [allowSubmit, setAllowSubmit] = useState<boolean>(false);
    const [localTemplates, setLocalTemplates] = useState<TemplateElement[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState(localTemplates.length ? localTemplates[0] : {
        templateName: null,
        templateId: null
    });

    const templateNameInputRef = useRef<HTMLInputElement>(null);
    const googleDocUrlInputRef = useRef<HTMLInputElement>(null);

    const getSavedTemplates = () => {
        // templateId is the currently selected template
        chrome.storage.local.get(['savedTemplates', 'templateId'])
            .then(({savedTemplates, templateId}) => {
                if (savedTemplates) {
                    setLocalTemplates(savedTemplates);
                }
                if (!templateId && (savedTemplates && savedTemplates.length > 0)) {
                    savedTemplates.length > 0 && setSelectedTemplate(savedTemplates[0]);
                    chrome.storage.local.set({templateId: savedTemplates[0].templateId});
                } else if (templateId && savedTemplates) {
                    const storedLocalTemplate = savedTemplates.filter((currTemplate: TemplateElement) => currTemplate.templateId === templateId);
                    setSelectedTemplate(storedLocalTemplate[0]);
                }
            });
        // .catch((err) => console.error('Error Retrieving Saved Google Doc Templates:', err)); // Might not be needed - non-reads will fallback to default values
    };

    // Get saved templates on load
    useEffect(() => {
        getSavedTemplates();
    }, []);

    const testGoogleDocURLShape = (url: string): boolean => {
        const regex = /^https:\/\/docs\.google\.com\/document\/d\/.*\/edit(?:.*)?$/;
        return regex.test(url);
    };

    const testGoogleDocUniqueness = (url: string) => {
        const strippedUrl = url.replace("https://docs.google.com/document/d/", "").replace(/\/edit.*$/, "");
        const templateIdExists = localTemplates.find(({templateId}) => templateId === strippedUrl);
        if (templateIdExists) {
            return true;
        }
        return false;
    };

    const testTemplateUniqueness = (name: string) => {
        const templateNameExists = localTemplates.find(({templateName}) => templateName === name);
        if (templateNameExists) {
            return true;
        }
        return false;
    };


    function handleInputChange() {
        const gDocUrl = googleDocUrlInputRef.current.value || '';
        const templateString = templateNameInputRef.current.value || '';

        setIsTemplateNameError('');
        setIsDocError('');

        // is unique gdoc
        const isUniqueGdoc = !testGoogleDocUniqueness(gDocUrl);
        if (!isUniqueGdoc) {
            setIsDocError('This Google Doc Has Already Been Added');
        }

        // is unique title
        const isUniqueTitle = !testTemplateUniqueness(templateString);
        if (!isUniqueTitle) {
            setIsTemplateNameError('This Template Name Is Already in Use');
        }

        if ([templateString.length > 0, testGoogleDocURLShape(gDocUrl), isUniqueGdoc, isUniqueTitle].every((e) => e === true)) {
            setAllowSubmit(true);
        } else {
            setAllowSubmit(false);
        }
    }

    const handleDeleteTemplate = (templateNameToDelete: string) => {
        const indexOfRemoval = localTemplates.findIndex(({templateName}) => templateName === templateNameToDelete);
        const newTemplates = localTemplates.filter(({templateName}) => templateName !== templateNameToDelete);
        chrome.storage.local.set({savedTemplates: newTemplates}, function () {
            setLocalTemplates(newTemplates);
            if (newTemplates.length > 0) {
                if (selectedTemplate.templateName === templateNameToDelete) {
                    const newTemplateIndex = Math.max(0, indexOfRemoval - 1);
                    setSelectedTemplate(newTemplates[newTemplateIndex]);
                    chrome.storage.local.set({templateId: newTemplates[newTemplateIndex].templateId});
                }
            } else {
                // If no templates
                chrome.storage.local.set({templateId: ''});
                setSelectedTemplate({templateName: null, templateId: null});
            }
        });

    };

    /* This handles selection and removal of the template button */
    const handleEventDelegate = (event: React.SyntheticEvent) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'BUTTON') {
            const clickedTemplateName = target.getAttribute('data-template-name');
            const deleteTemplateName = target.getAttribute('data-template-name-delete');
            const dataTemplateId = target.getAttribute('data-template-id');
            if (clickedTemplateName && dataTemplateId) {
                setSelectedTemplate({templateId: dataTemplateId, templateName: clickedTemplateName});
                // set local storage template
                chrome.storage.local.set({templateId: dataTemplateId});
            }
            if (deleteTemplateName && dataTemplateId) {
                handleDeleteTemplate(deleteTemplateName);
            }
        }
    };

    /* If the new template info is filled in we can capture enter key */
    const handleAddTemplateKeyDown = (event: React.KeyboardEvent) => {
        const target = (event.target as HTMLElement).tagName;

        if (event.key === 'Enter' && allowSubmit && target !== 'BUTTON') {
            handleSubmitClick();
        }
    };

    /* Clear the entries on Cancel button click */
    const handleCancelAndClear = () => {
        if (googleDocUrlInputRef.current && templateNameInputRef.current) {
            templateNameInputRef.current.value = '';
            googleDocUrlInputRef.current.value = '';
            setIsDocError('');
        }
        setAllowSubmit(false);
    };

    /* On Submit click we attempt to get the google doc to ensure it's valid.
       If it's valid, we add it  */
    async function handleSubmitClick() {
        const googleData = googleDocUrlInputRef.current.value;
        const templateString = templateNameInputRef.current.value || '';
        const strippedUrl = googleData.replace("https://docs.google.com/document/d/", "").replace(/\/edit.*$/, "");
        try {
            setIsCheckingGoogleUrl(true);
            // We're doing a quick fetch of the doc to check it's validity
            await getDocument(strippedUrl);
            // If it's an addition to an empty array, we immediately add it as the selected
            if (localTemplates.length === 0) {
                setSelectedTemplate(() => {
                    const selected = {templateId: strippedUrl, templateName: templateString};
                    chrome.storage.local.set({templateId: strippedUrl});
                    return selected;
                });
            }
            setLocalTemplates((s) => {
                const newTemplates = [...s, {templateId: strippedUrl, templateName: templateString}];
                chrome.storage.local.set({savedTemplates: newTemplates});
                return newTemplates;
            });
            handleCancelAndClear();
            // write to local
        } catch (error) {
            setIsDocError('Invalid Google Doc URL or Account');
        }
        setIsCheckingGoogleUrl(false);
    }

    const listAnimations = {
        initial: {scale: 0.9, opacity: 0},
        animate: {scale: 1, opacity: 1},
        exit: {scale: 0, opacity: 0},
        transition: {ease: 'linear', type: "spring", stiffness: 500, damping: 40, mass: 0.5}
    };

    const ulAnimations = {
        animate: {
            transition: {
                type: "spring",
                bounce: 0,
                duration: 0.7,
                delayChildren: 0.3,
                staggerChildren: 0.05
            }
        },
        exit: {
            transition: {
                type: "spring",
                bounce: 0,
                duration: 0.3
            }
        }
    };

    return (
        <div className="template_module" onKeyDown={handleAddTemplateKeyDown}>
            {/* Template selection buttons */}
            <motion.div className="template_selection">
                <h3>Available Templates</h3>
                <AnimatePresence mode="popLayout">
                    {localTemplates.length === 0 ? (
                        <motion.h2 {...ulAnimations} key="missing-template"
                                   className="template_button_group-missing_template">In order to proceed, please add a
                            Google Doc URL for your template document. Need some help getting started? Try one of our <a
                                href="https://drive.google.com/drive/folders/16Nl2GfZy4J0hbTru2FKSpgYO38eQ3pBn?usp=sharing"
                                target="_blank" rel="noopener noreferrer">templates</a>.</motion.h2>
                    ) : (
                        <motion.ul key="ul-has-template" {...ulAnimations} className="template_button_group-list"
                                   onClick={handleEventDelegate}>
                            {localTemplates.sort((a, b) => a.templateName.localeCompare(b.templateName)).map(({
                                                                                                                  templateName,
                                                                                                                  templateId
                                                                                                              }) => (
                                <motion.li {...listAnimations} layout key={templateName}>
                                    <TemplateButton label={templateName} templateId={templateId}
                                                    isSelected={selectedTemplate.templateName === templateName}/>
                                </motion.li>
                            ))}
                        </motion.ul>)}
                </AnimatePresence>
            </motion.div>
            {/* Add template part */}
            <motion.div layout className="add_template">
                <h3>Add Template</h3>
                <div className="add_template-text_input_wrap">
                    <TextInput
                        ref={googleDocUrlInputRef}
                        onChange={handleInputChange}
                        label="Google Doc URL*"
                        type="text"
                        showSpinner={isCheckingUrl}
                        error={isDocError}
                        placeholder="https://docs.google.com/document/d/.../edit"
                    />
                    <TextInput
                        ref={templateNameInputRef}
                        onChange={handleInputChange}
                        label="Template Name*"
                        error={isTemplateNameError}
                        type="text"/>
                </div>
                <div className="add_template-button_wrap">
                    <PillButton label="Cancel" type="secondary" size="small" callback={handleCancelAndClear}
                                disabled={false}/>
                    <PillButton label="Add Template" type="primary-green" size="small" callback={handleSubmitClick}
                                disabled={!allowSubmit}/>
                </div>
            </motion.div>
        </div>
    );
}
