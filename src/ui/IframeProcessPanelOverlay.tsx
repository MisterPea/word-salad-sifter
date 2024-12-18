import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { PanelNotificationsType } from '../types';
import useNotifications from '../components/hooks/useNotifications';

interface ProcessPanelOverlayProps {
  stage?: PanelNotificationsType | null; // Optional prop to pass text when in Storybook
}

export default function ProcessPanelOverlay({ stage = null }: ProcessPanelOverlayProps) {
  const [notifyText, setNotifyText] = useState<PanelNotificationsType>("zero");
  const [estimatedTime, setEstimatedTime] = useState<number>(3);
  const finalDotRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(3);

  // When in storybook we manually set notifyText
  if (stage === null) {
    useNotifications(setNotifyText, setEstimatedTime);
  }

  // For storybook we have to look for stage to change.
  useEffect(() => {
    if (stage !== null) {
      setNotifyText(stage);
    }
  }, [stage]);

  // We're creating a simple timer to count down from estimated time.
  useEffect(() => {
    if (notifyText === 'one') {
      // We need to wait till we get estimated time through notification system
      setTimeRemaining(Math.ceil(estimatedTime));
    }
    if (notifyText === 'two' && timerRef.current === null) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((s) => Math.max(0, s - 1));
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [notifyText]);


  const progressMap = {
    // [circle 1, circle 2, circle 3, bar 1 color, bar 1 width, bar 2 color, bar 2 width, bar 3 color, bar 3 width ]
    zero: ['10px', '10px', '10px', '#dddddd', 0, '#dddddd', 0, '#dddddd', 0,],
    one: ['100px', '10px', '10px', '#3b3b3b', 0, '#dddddd', 0, '#dddddd', 0,],
    two: ['10px', '100px', '10px', '#20aa35', 100, '#3b3b3b', 0, '#dddddd', 0,],
    three: ['10px', '10px', '100px', '#20aa35', 100, '#20aa35', 100, '#3b3b3b', 0,],
    four: ['10px', '10px', '10px', '#20aa35', 100, '#20aa35', 100, '#20aa35', 100,],
    hidden: ['10px', '10px', '10px', '#dddddd', 0, '#dddddd', 0, '#dddddd', 0,],
    error: ['10px', '10px', '10px', '#d70015', 10, '#d70015', 10, '#d70015', 10,],
  };

  const [wOne, wTwo, wThree, colorOne, finWidthOne, colorTwo, finWidthTwo, colorThree, finWidthThree] = progressMap[notifyText as PanelNotificationsType];
  const textTranslate = { zero: -8, one: -8, two: -31, three: -54, four: -78, hidden: 350, error: -100 };

  return (
    <div className="word_salad-overlay_wrapper">
      <div className="word_salad-overlay_inner">
        <p style={{ opacity: notifyText === 'two' ? 1 : 0 }} className="word_salad-overlay_inner-time_remaining">{`Approx. ${timeRemaining} Seconds Remaining`}</p>
        <div className="word_salad-overlay_inner-top">
          <ul style={{ transform: `translateY(${textTranslate[notifyText]}px)` }}>
            <li style={{ opacity: notifyText === 'one' ? 1 : 0 }}>Cloning Document</li>
            <li style={{ opacity: notifyText === 'two' ? 1 : 0 }}>Processing Text via LLM</li>
            <li style={{ opacity: notifyText === 'three' ? 1 : 0 }}>Building Google Document</li>
            <li style={{ opacity: notifyText === 'four' ? 1 : 0 }}>Sifting Complete • Document Created</li>
            <li style={{ opacity: notifyText === 'error' ? 1 : 0 }}>Error: Now Deleting Cloned Document</li>
          </ul>
        </div>
        <div className="word_salad-overlay_inner-bottom">
          <div className={`word_salad-overlay-progress_bar-wrapper${notifyText === 'four' ? " complete" : ""}${notifyText === "error" ? " has-error" : ""}`}>
            <div className="word_salad-overlay-progress_bar one" style={{ minWidth: '10px', width: wOne }}>
              <div
                className={`word_salad-overlay-progress_bar-inner one${notifyText === 'one' ? ' active' : ''}`}
                style={{ animation: notifyText === 'one' ? 'bar-tween 3500ms linear forwards' : 'none', width: finWidthOne, backgroundColor: colorOne }}
              />
            </div>
            <div className="word_salad-overlay-progress_bar two" style={{ minWidth: '10px', width: wTwo }}>
              <div
                className={`word_salad-overlay-progress_bar-inner two${notifyText === 'two' ? ' active' : ''}`}
                style={{ animation: notifyText === 'two' ? `bar-tween ${Math.round(+estimatedTime * 1000)}ms linear forwards` : 'none', width: finWidthTwo, backgroundColor: colorTwo }}
              />
            </div>
            <div className="word_salad-overlay-progress_bar three" style={{ minWidth: '10px', width: wThree }}>
              <div
                ref={finalDotRef}
                className={`word_salad-overlay-progress_bar-inner three${notifyText === 'three' ? ' active' : ''}`}
                style={{ animation: notifyText === 'three' ? 'bar-tween 1500ms linear forwards' : 'none', width: finWidthThree, backgroundColor: colorThree }}
              />
            </div>
          </div>
        </div>
        {notifyText === 'four' && <div className="word_salad-overlay-svg_wrapper">
          <div className="word_salad-overlay-svg_wrapper-inner">
            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"></circle>
              <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"></path>
            </svg>
          </div>
        </div>}
      </div>
    </div>
  );
}