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
      currStage = ' hidden';
  }

  return (
    <>
      {stage !== 'hidden' && <div aria-hidden={currStage === '' || currStage === ' hidden'} className={`panel_notifications${currStage}`}>
        <div className="panel_notifications-wrap">
          <div aria-live="polite" className={`panel_notifications-bar${currStage}`}>
            <h1 className="panel_notifications-notify_text">Processing Text</h1>
            <div className="panel_notifications-barber_pole" />
          </div>
        </div>
      </div>}
    </>
  );
}