/**
 * Type definitions for the modified Hammer.js library for Konva
 */

declare class Hammer {
  constructor(element: any, options?: HammerOptions);
  
  on(events: string, handler: (ev: HammerEvent) => void): this;
  off(events: string, handler?: (ev: HammerEvent) => void): this;
  destroy(): void;
  
  get(recognizer: string): HammerRecognizer;
  add(recognizer: HammerRecognizer): this;
  remove(recognizer: HammerRecognizer): this;
  
  static Manager: typeof HammerManager;
  static Recognizer: typeof HammerRecognizer;
  static Pan: typeof HammerRecognizer;
  static Pinch: typeof HammerRecognizer;
  static Press: typeof HammerRecognizer;
  static Rotate: typeof HammerRecognizer;
  static Swipe: typeof HammerRecognizer;
  static Tap: typeof HammerRecognizer;
}

interface HammerOptions {
  domEvents?: boolean;
  touchAction?: string;
  enable?: boolean;
}

interface HammerEvent {
  type: string;
  deltaX: number;
  deltaY: number;
  deltaTime: number;
  distance: number;
  angle: number;
  velocityX: number;
  velocityY: number;
  velocity: number;
  direction: number;
  offsetDirection: number;
  scale: number;
  rotation: number;
  center: { x: number; y: number };
  srcEvent: Event;
  target: EventTarget;
  pointerType: string;
  eventType: number;
  isFirst: boolean;
  isFinal: boolean;
  pointers: any[];
  changedPointers: any[];
  preventDefault(): void;
  evt: {
    gesture: HammerEvent;
  };
}

declare class HammerManager {
  constructor(element: any, options?: HammerOptions);
  
  on(events: string, handler: (ev: HammerEvent) => void): this;
  off(events: string, handler?: (ev: HammerEvent) => void): this;
  destroy(): void;
  
  get(recognizer: string): HammerRecognizer;
  add(recognizer: HammerRecognizer | HammerRecognizer[]): this;
  remove(recognizer: HammerRecognizer): this;
}

declare class HammerRecognizer {
  constructor(options?: any);
  
  set(options: any): this;
  recognizeWith(recognizer: HammerRecognizer | string): this;
  dropRecognizeWith(recognizer: HammerRecognizer | string): this;
  requireFailure(recognizer: HammerRecognizer | string): this;
  dropRequireFailure(recognizer: HammerRecognizer | string): this;
}

export default Hammer;
