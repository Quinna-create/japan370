/**
 * Type definitions for dmak
 * Dmak is a JavaScript library for drawing animated kanji stroke order diagrams
 */

declare module 'dmak' {
  export default class Dmak {
    constructor(character: string, options?: {
      element?: HTMLElement;
      uri?: string;
      stroke?: {
        order?: {
          visible?: boolean;
          attr?: {
            [key: string]: any;
          };
        };
      };
      autoplay?: boolean;
      height?: number;
      width?: number;
    });
    
    render(): void;
    pause(): void;
    eraseLastStrokes(count: number): void;
    renderNextStrokes(count: number): void;
  }
}
