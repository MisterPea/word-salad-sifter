import * as React from 'react';
import { Icon } from './Icons';

interface TemplateButtonProps {
  label: string;
  templateId: string;
  isSelected: boolean;
}

export default function TemplateButton({ label, templateId, isSelected = false }: TemplateButtonProps) {
  return (
    <div aria-selected={isSelected} className={`template_button${isSelected ? " --selected" : ""}`}>
      <button
        role="switch"
        type="button"
        disabled={isSelected}
        className="template_button-submit"
        data-template-name={label}
        data-template-id={templateId}
        tabIndex={isSelected ? -1 : 0}
      >
        <div
          className="template_button-submit-icon">
          {isSelected ? <Icon.SelectCheck /> : <Icon.SelectCircle />}
        </div>
        <p role="presentation">{label}</p>
      </button>
      <button
        role='button'
        type="button"
        className="template_button-delete"
        data-template-name-delete={`${label}`}
        data-template-id={templateId}
        tabIndex={-1}
      >
        <div className="template_button-delete-icon">
          <Icon.RemoveTemplate />
        </div>
      </button>
    </div>

  );
}