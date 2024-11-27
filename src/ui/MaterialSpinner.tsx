import { ColorType } from '../types'
import * as React from 'react';

export type PathLimits = {
  min: number,
  max: number,
};

export interface MaterialSpinnerProps {
  /** Radius of spinner @default 18 */
  radius?: number;
  /** Width of the stroke for track and path @default 4 */
  strokeWidth?: number;
  /** Duration of 1 rotation - in milliseconds @default 800 */
  rotationDuration?: number;
  /** Duration of the animation for the path - in milliseconds @default 4000 */
  pathAnimationDuration?: number;
  /** Path limits - how big and how small the path should animate in percent 0-1 @default {min: 0.02, max:0.98} */
  pathLimits?: PathLimits;
  /** Setting whether the path is static or not @default false */
  staticPath?: boolean;
  /** When employing a static path - what is the length in percent 0-1 @default 0.5 (50%) */
  staticPathLength?: number;
  /** Determine whether to show the track or not @default true */
  showTrack?: boolean;
  /** Determine the track color @default lightgrey */
  trackColor?: ColorType;
  /** Determine the path color @default black */
  pathColor?: ColorType;
}

export default function MaterialSpinner({
  radius = 18,
  strokeWidth = 4,
  rotationDuration = 800,
  pathAnimationDuration = 2000,
  pathLimits = { min: 0.02, max: 0.98 },
  staticPath = false,
  staticPathLength = 0.5,
  showTrack = true,
  trackColor = 'lightgrey',
  pathColor = 'black',
}:MaterialSpinnerProps) {

  const strokeLength = 2 * Math.PI * radius;

  const stylesheet = document.styleSheets[0];
  const strokeAnimationName = 'materialCirc';
  const rotateAnimationName = 'rotate';

  const strokeKeyframes = `
    @keyframes ${strokeAnimationName} {
      0% {stroke-dashoffset: ${strokeLength - (strokeLength * pathLimits.min)}}
      100% {stroke-dashoffset:${strokeLength - (strokeLength * pathLimits.max)}}
    }
  `;

  const rotateKeyframes = `
    @keyframes ${rotateAnimationName} {
      0% {transform: rotate(0)}
      100% {transform: rotate(360deg)}
    }
  `;

  stylesheet.insertRule(strokeKeyframes, stylesheet.cssRules.length);
  stylesheet.insertRule(rotateKeyframes, stylesheet.cssRules.length);
  const circleStyleAnimate = {
    animationName: strokeAnimationName,
    animationTimingFunction: 'ease-in-out',
    animationDuration: `${pathAnimationDuration}ms`,
    animationIterationCount: 'infinite',
    animationDirection: 'alternate',
    animationFillMode: 'forwards',
    strokeDasharray: `${strokeLength}`,
    stokeDashoffset: `${strokeLength}`
  };

  const circleStyleStatic = {
    strokeDasharray: `${strokeLength}`,
    strokeDashoffset: `${strokeLength - (strokeLength * staticPathLength)}`
  };

  const rotateStyle = {
    animationName: rotateAnimationName,
    animationTimingFunction: 'linear',
    animationDuration: `${rotationDuration}ms`,
    animationIterationCount: 'infinite',
    animationDirection: 'normal',
    animationFillMode: 'forwards',
  };

  return (
    <svg data-testid="material-spinner" height={(radius * 2) + (strokeWidth * 2)} width={(radius * 2) + (strokeWidth * 2)} >
      <g style={{ ...rotateStyle, transformOrigin: 'center' }}>
        {showTrack && <circle cx={radius + strokeWidth} cy={radius + strokeWidth} r={radius} strokeWidth={strokeWidth} stroke={trackColor} fill='none' />}
        <circle cx={radius + strokeWidth} cy={radius + strokeWidth} r={radius}
          fill="none"
          stroke={pathColor}
          strokeWidth={strokeWidth}
          style={staticPath ? circleStyleStatic : circleStyleAnimate}
        />
      </g>
    </svg>
  );
}