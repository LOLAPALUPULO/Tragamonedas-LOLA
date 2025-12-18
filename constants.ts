
import { SymbolName } from './types';

export const SYMBOL_IMAGES: { [key: string]: string } = {
  'GOLDEN': 'https://raw.githubusercontent.com/LOLAPALUPULO/Tragamonedas-LOLA/refs/heads/main/golden.svg',
  'HONEY': 'https://raw.githubusercontent.com/LOLAPALUPULO/Tragamonedas-LOLA/refs/heads/main/honey.svg',
  'IPA': 'https://raw.githubusercontent.com/LOLAPALUPULO/Tragamonedas-LOLA/refs/heads/main/ipa.svg',
  'S_IPA': 'https://raw.githubusercontent.com/LOLAPALUPULO/Tragamonedas-LOLA/refs/heads/main/lola.svg', // 'Lola' image used for S.IPA
  'LOLAPALUPULO': 'https://raw.githubusercontent.com/LOLAPALUPULO/Tragamonedas-LOLA/refs/heads/main/lolapalupulo.svg',
  'LUPULO': 'https://raw.githubusercontent.com/LOLAPALUPULO/Tragamonedas-LOLA/refs/heads/main/lupulo.svg',
  'PORTER': 'https://raw.githubusercontent.com/LOLAPALUPULO/Tragamonedas-LOLA/refs/heads/main/porter.svg',
  'SCOTISH': 'https://raw.githubusercontent.com/LOLAPALUPULO/Tragamonedas-LOLA/refs/heads/main/scotish.svg',
};

// Prize beers that can be won as physical prizes (pintas)
export const PRIZE_BEERS: SymbolName[] = [
  'S_IPA', 'SCOTISH', 'GOLDEN', 'HONEY', 'IPA', 'PORTER'
];

// All available symbols for the reels
export const ALL_SYMBOLS: SymbolName[] = Object.keys(SYMBOL_IMAGES) as SymbolName[];

export const NUM_REELS = 3;
export const INITIAL_CREDITS = 1000; // Cosmetic for display
export const BET_AMOUNT = 10;        // Cosmetic for display
export const WIN_MULTIPLIER = 10;    // Not used for credit wins anymore

export const REEL_SPIN_DURATION_MS = 2000; // Total duration a reel spins before stopping
export const REEL_STOP_DELAY_MS = 300; // Delay between each reel stopping
export const REEL_VISIBLE_SYMBOLS = 3; // How many symbols are visible in the reel window at once
export const SYMBOL_HEIGHT = 100; // Height of a single symbol image in pixels (for calculation)

export const WIN_CHANCE_PERCENTAGE = 30; // Percentage chance for a winning spin (for demonstration)