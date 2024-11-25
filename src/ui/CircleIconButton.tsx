import * as React from "react";
import { Icon } from "./Icons";

interface CircleIconButtonProps {
  type: 'help' | 'settings';
  onClick: () => void;
  [x: string]: any;
}

export default function CircleIconButton({ onClick, type, ...rest }: CircleIconButtonProps) {
  return (
    <button onClick={onClick} {...rest} className={`circle_icon_button${rest.className ? " " + rest.className : ""}`}>
      {type === 'help' ? (<Icon.Help />) : (<Icon.Settings />)}
    </button>
  );
}