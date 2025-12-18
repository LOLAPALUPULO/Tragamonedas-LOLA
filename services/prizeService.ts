
import { PrizeCounts, SymbolName } from '../types';
import { PRIZE_BEERS } from '../constants';

const PRIZE_STORAGE_KEY = 'lola-slots-prizes';

/**
 * Retrieves the current prize counts from local storage.
 * If no counts are found, it initializes them to 0 for all prize beers.
 */
export const getPrizeCounts = (): PrizeCounts => {
  const storedPrizes = localStorage.getItem(PRIZE_STORAGE_KEY);
  if (storedPrizes) {
    try {
      const parsed = JSON.parse(storedPrizes) as PrizeCounts;
      // Ensure all prize beers are in the object, even if 0
      const completePrizes: PrizeCounts = {};
      PRIZE_BEERS.forEach(beer => {
        completePrizes[beer] = parsed[beer] !== undefined ? parsed[beer] : 0;
      });
      return completePrizes;
    } catch (e) {
      console.error('Error parsing prize counts from localStorage', e);
      // Fallback to default if parsing fails
    }
  }

  // Initialize with 0 for all prize beers if no data or parse error
  const initialPrizes: PrizeCounts = {};
  PRIZE_BEERS.forEach(beer => {
    initialPrizes[beer] = 0;
  });
  return initialPrizes;
};

/**
 * Saves the given prize counts to local storage.
 * @param prizes The PrizeCounts object to save.
 */
export const setPrizeCounts = (prizes: PrizeCounts): void => {
  localStorage.setItem(PRIZE_STORAGE_KEY, JSON.stringify(prizes));
};

/**
 * Decrements the count for a specific prize beer.
 * @param beerName The SymbolName of the prize beer to decrement.
 * @returns true if the prize was decremented successfully, false if the prize was not available.
 */
export const decrementPrize = (beerName: SymbolName): boolean => {
  const prizes = getPrizeCounts();
  if (prizes[beerName] && prizes[beerName] > 0) {
    prizes[beerName]--;
    setPrizeCounts(prizes);
    return true;
  }
  return false;
};

/**
 * Resets all prize counts to 0.
 */
export const resetPrizeCounts = (): void => {
  const initialPrizes: PrizeCounts = {};
  PRIZE_BEERS.forEach(beer => {
    initialPrizes[beer] = 0;
  });
  setPrizeCounts(initialPrizes);
};