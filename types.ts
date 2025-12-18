
// Define SymbolName based on keys from SYMBOL_IMAGES in constants.ts
import { SYMBOL_IMAGES } from './constants';

export type SymbolName = keyof typeof SYMBOL_IMAGES;

export interface PrizeCounts {
  [key: string]: number; // Example: { 'S_IPA': 5, 'GOLDEN': 3 }
}

export interface ReelState {
  spinning: boolean;
  result: SymbolName;
  currentPosition: number; // For animation purposes
  spinDuration: number;
}
