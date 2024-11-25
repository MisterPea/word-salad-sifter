import * as React from 'react';
import { PanelNotificationsProps } from '../types';

export default function PanelNotifications({ stage }: PanelNotificationsProps) {

  let currStage = '';
  switch (stage) {
    case 'hidden':
      currStage = ' hidden';
      break;
    case 'zero':
      currStage = ' zero';
      break;
    case 'one':
      currStage = ' zero one';
      break;
    case 'two':
      currStage = ' zero one two';
      break;
    case 'three':
      currStage = ' zero one two three';
      break;
    case 'four':
      currStage = ' zero one two three four';
      break;
    case 'error':
      currStage = ' zero error';
      break;
    default:
      break;
  }

  return (
    <div aria-hidden={currStage === '' || currStage === ' hidden'} className={`panel_notifications${currStage}`}>
      <div className="panel_notifications-wrap">
        <div aria-live="polite" className={`panel_notifications-bar${currStage}`}>
          <div className="panel_notifications-bar-progress"></div>
          <ul>
            <li>Cloning Document</li>
            <li>Processing Text via LLM</li>
            <li>Building Google Document</li>
          </ul>
          {stage === 'four' && <div className="panel_notifications-svg_wrapper">
            <div className="panel_notifications-svg_wrapper-inner">
              <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"></circle>
                <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"></path>
              </svg>
              <p>Sifting Complete</p>
              <p>Document Created</p>
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
}