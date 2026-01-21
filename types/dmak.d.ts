/**
 * Type definitions for dmak
 * Dmak is a JavaScript library for drawing animated kanji stroke order diagrams
 */

declare module 'dmak' {
  interface DmakOptions {
    element?: HTMLElement;
    uri?: string;
    stroke?: {
      order?: {
        visible?: boolean;
        attr?: Record<string, string | number>;
      };
    };
    autoplay?: boolean;
    height?: number;
    width?: number;
  }

  export default class Dmak {
    constructor(character: string, options?: DmakOptions);
    
    render(): void;
    pause(): void;
    eraseLastStrokes(count: number): void;
    renderNextStrokes(count: number): void;
  }
}
