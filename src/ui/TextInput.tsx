import * as React from 'react';
import MaterialSpinner from './MaterialSpinner';

interface TextInputProps {
  type: 'text' | 'password';
  placeholder?: string;
  label: string;
  onChange: () => void;
  error?: string;
  showSpinner?: boolean;
}

const TextInput = React.forwardRef((props: TextInputProps, ref?: React.MutableRefObject<HTMLInputElement>) => {
  const { type, placeholder, label, onChange, error, showSpinner } = props;

  const convertLabelToId = (label: string) => {
    let id = '';
    for (let i = 0; i < label.length; i += 1) {
      const letter = label[i];
      if (letter === ' ') {
        id += '-';
      } else {
        id += letter.toLowerCase();
      }
    }
    return id;
  };

  return (
    <div className={`text_input-wrapper${error ? ' error-active' : ''}`}>
      <label
        className="text_input-label_top"
        htmlFor={convertLabelToId(label)}>
        {label}
      </label>
      <div className="text_input-wrap_for_input_and_spinner">
        <input
          autoComplete='off'
          ref={ref}
          onChange={onChange}
          tabIndex={0}
          type={type}
          id={convertLabelToId(label)}
          placeholder={placeholder || ''}
          aria-invalid={error ? error.length > 0 : false}
        />
        {showSpinner && <div className="text_input-wrap-spinner_wrap">
          <MaterialSpinner
            radius={8}
            strokeWidth={2}
            pathColor='#248a3d'
            pathAnimationDuration={3000}
          />
        </div>}
      </div>
      <div
        className="text_input-error_label"
        aria-errormessage={error}
      >
        {error}
      </div>
    </div>
  );
});

export default TextInput;