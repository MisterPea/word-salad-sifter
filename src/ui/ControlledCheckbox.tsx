import * as React from "react";
import { ChangeEvent } from "react";

interface CheckboxProps {
  checked?: boolean;
  handleChange: (e?: ChangeEvent) => void;
  label: string;
}

export default function Checkbox({ handleChange, checked, label }: CheckboxProps) {
  return (
    <div className="checkbox-wrap">
      <input
        type="checkbox"
        tabIndex={0}
        onChange={handleChange}
        id={`id-${label}`}
        value={label}
        checked={checked}
        role="checkbox"
        aria-checked={checked}
      />
      <label
        className="checkbox-main "
        htmlFor={`id-${label}`}
      >
        {label}
      </label>
    </div>
  );
}