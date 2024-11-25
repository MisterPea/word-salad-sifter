import * as React from "react";

interface PillButtonProps {
  label: string;
  type?: 'primary-dark' | 'primary-green' | 'secondary';
  size: 'small' | 'large';
  disabled?: boolean;
  callback: () => void;
  [x: string]: unknown;
}

export default function PillButton({ label, type = 'secondary', size = 'small', disabled = false, callback, ...rest }: PillButtonProps) {

  const handleButtonClick = () => {
    if (!disabled) {
      callback();
    }
  };

  return (
    <button
      {...rest}
      role="button"
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={handleButtonClick}
      disabled={disabled}
      className={`pill_button ${type}${disabled ? " disabled" : ""} ${size}${rest.className ? ' ' + rest.className : ''}`}
    >
      {label}
    </button>
  );
}