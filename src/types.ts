interface RgbColor {
  red: number;
  green: number;
  blue: number;
}

interface Color {
  rgbColor: RgbColor;
}

interface ForegroundColor {
  color: Color;
}

interface FontSize {
  magnitude: number;
  unit: string;
}

interface WeightedFontFamily {
  fontFamily: string;
  weight: number;
}

interface TextStyle {
  underline: boolean;
  foregroundColor: ForegroundColor;
  fontSize: FontSize;
  weightedFontFamily: WeightedFontFamily;
}

interface TextRun {
  content: string;
  textStyle: TextStyle;
}

interface Element {
  startIndex: number;
  endIndex: number;
  textRun: TextRun;
}

interface Space {
  magnitude: number;
  unit: string;
}

interface ParagraphStyle {
  namedStyleType: string;
  direction: string;
  spacingMode: string;
  spaceAbove: Space;
  spaceBelow: Space;
  indentFirstLine: Space;
  indentStart: Space;
  indentEnd: Space;
}

interface Paragraph {
  elements: Element[];
  paragraphStyle: ParagraphStyle;
}

export interface DocumentObject {
  startIndex: number;
  endIndex: number;
  paragraph: Paragraph;
}

/* *************************** */

interface ContainsText {
  text: string;
  matchCase: boolean;
}

interface ReplaceAllText {
  containsText: ContainsText;
  replaceText: string;
}

export type BatchUpdateRequest = {
  insertText?: {
    text: string;
    location: {
      index: number;
    };
  };
  insertPageBreak?: {
    location: {
      index: number;
    };
  };
};

interface ReplaceTextObject {
  replaceAllText: ReplaceAllText;
}

export default ReplaceTextObject;

type HexColor = `#${'0123456789abcdef' | 'ABCDEF'}{6}`;
type HexColorAlpha = `#${'0123456789abcdef' | 'ABCDEF'}{6}${'0123456789'}{2}`;
type RGBColor = `rgb(${number},${number},${number})`;
type RGBAColor = `rgba(${number},${number},${number},${number})`;
type HSLColor = `hsl(${number}, ${string}, ${string})`;

export type ColorType = string | HexColor | HexColorAlpha | RGBColor | RGBAColor | HSLColor;

export type TemplateElement = {
  templateId: string,
  templateName: string,
};


export interface PanelNotificationsProps {
  stage: 'zero' | 'one' | 'two' | 'three' | 'four' | 'error' | 'hidden';
}
export type PanelNotificationsType = 'zero' | 'one' | 'two' | 'three' | 'four' | 'error' | 'hidden';