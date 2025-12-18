
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Reel from './Reel';
import Button from './Button';
import Confetti from './Confetti';
import {
  ALL_SYMBOLS,
  NUM_REELS,
  REEL_SPIN_DURATION_MS,
  REEL_STOP_DELAY_MS,
  PRIZE_BEERS,
  BET_AMOUNT,
  WIN_CHANCE_PERCENTAGE, // Import new constant
} from '../constants';
import { SymbolName } from '../types';
import { decrementPrize } from '../services/prizeService';

interface SlotMachineProps {
  credits: number; // Credits are now cosmetic, always high
  onCreditsChange: (newCredits: number) => void; // Cosmetic, no actual deduction
}

const SlotMachine: React.FC<SlotMachineProps> = ({ credits, onCreditsChange }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [reelResults, setReelResults] = useState<SymbolName[]>(
    Array(NUM_REELS).fill(ALL_SYMBOLS[0])
  );
  const [reelsStopped, setReelsStopped] = useState<boolean[]>(
    Array(NUM_REELS).fill(false)
  );
  const [winMessage, setWinMessage] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const spinTimeoutRefs = useRef<number[]>([]);

  // Checks for a win condition and identifies if it's a prize beer
  const checkWin = useCallback((): { isMatch: boolean; prizeBeer: SymbolName | null } => {
    if (reelResults.length === NUM_REELS && reelsStopped.every(Boolean)) {
      const firstSymbol = reelResults[0];
      const allMatch = reelResults.every((symbol) => symbol === firstSymbol);

      if (allMatch) {
        // If all symbols match, check if it's one of the prize beers
        const prizeBeerMatch = PRIZE_BEERS.includes(firstSymbol);
        return { isMatch: true, prizeBeer: prizeBeerMatch ? firstSymbol : null };
      }
    }
    return { isMatch: false, prizeBeer: null };
  }, [reelResults, reelsStopped]);

  const handleSpinEnd = useCallback((index: number, finalSymbol: SymbolName) => {
    // This handler is now mostly for the Reel component to signal its completion,
    // the main win logic is in the useEffect below.
    // It's crucial for the `reelsStopped` array to be updated correctly here.
    setReelsStopped((prev) => {
      const newStopped = [...prev];
      newStopped[index] = true;
      return newStopped;
    });
    setReelResults((prev) => {
      const newResults = [...prev];
      newResults[index] = finalSymbol; // Update with the actual stopping symbol
      return newResults;
    });
  }, []);

  const spinReels = useCallback(() => {
    if (isSpinning) { // Credits check removed as game is free play
      return;
    }

    // Clear any previous timeouts to prevent interference
    spinTimeoutRefs.current.forEach(clearTimeout);
    spinTimeoutRefs.current = [];

    // Reset game state for a new spin
    setIsSpinning(true);
    setWinMessage(null);
    setShowConfetti(false);
    setReelsStopped(Array(NUM_REELS).fill(false));

    let finalSymbols: SymbolName[] = [];
    const shouldWin = Math.random() * 100 < WIN_CHANCE_PERCENTAGE;

    if (shouldWin) {
      // Force a win: pick a random prize beer and make all reels stop on that symbol
      const winningSymbol = PRIZE_BEERS[Math.floor(Math.random() * PRIZE_BEERS.length)];
      finalSymbols = Array(NUM_REELS).fill(winningSymbol);
    } else {
      // Generate random symbols for a non-winning spin
      finalSymbols = Array(NUM_REELS)
        .fill(null)
        .map(() => ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)]);
      
      // Optional: Try to prevent accidental wins if not forced (though rare with many symbols)
      // This is less critical since PRIZE_BEERS logic handles the "real" wins
      const firstSymbol = finalSymbols[0];
      const allMatch = finalSymbols.every(symbol => symbol === firstSymbol);
      if (allMatch && PRIZE_BEERS.includes(firstSymbol)) {
        // If a random spin results in an accidental prize win, re-randomize one reel
        let differentSymbol = firstSymbol;
        while(differentSymbol === firstSymbol) {
          differentSymbol = ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)];
        }
        finalSymbols[Math.floor(Math.random() * NUM_REELS)] = differentSymbol;
      }
    }

    // Start each reel's spin animation and schedule its stop
    for (let i = 0; i < NUM_REELS; i++) {
      const stopDelay = (i + 1) * REEL_STOP_DELAY_MS; // Staggered stop for visual effect
      spinTimeoutRefs.current.push(
        // The actual result for Reel component's animation is set here
        // The Reel will then handle its own internal animation and call handleSpinEnd when done
        setTimeout(() => {
          setReelResults((prev) => {
            const newResults = [...prev];
            newResults[i] = finalSymbols[i]; // Provide the target symbol for the reel
            return newResults;
          });
          // Note: `setReelsStopped[i] = true` is now managed within `handleSpinEnd` 
          // which is called by the `Reel` component when its animation fully completes.
        }, REEL_SPIN_DURATION_MS + stopDelay)
      );
    }
  }, [isSpinning]); // Dependencies: only isSpinning

  // Effect to handle win/loss outcome once all reels have stopped
  useEffect(() => {
    // Only proceed if all reels have stopped AND a spin was initiated
    if (reelsStopped.every(Boolean) && isSpinning) {
      const { isMatch, prizeBeer } = checkWin();

      if (isMatch) {
        if (prizeBeer) {
          // It's a prize beer win! Attempt to decrement prize count
          const prizeClaimed = decrementPrize(prizeBeer);
          if (prizeClaimed) {
            setWinMessage(`¡FELICIDADES! Ganaste una PINTA de CERVEZA ${prizeBeer.replace('_', ' ')}.`);
            setShowConfetti(true);
          } else {
            setWinMessage(`¡FELICIDADES! Tienes una combinación de ${prizeBeer.replace('_', ' ')}, pero ya no hay más pintas disponibles.`);
            setShowConfetti(true);
          }
        } else {
          // It's a match, but not a defined prize beer
          setWinMessage(`¡Felicidades! Tienes una combinación de ${reelResults[0].replace('_', ' ')}, pero no es una pinta.`);
          setShowConfetti(true);
        }
      } else {
        setWinMessage('¡INTÉNTALO DE NUEVO!');
      }
      setIsSpinning(false); // End the spinning state
    }
  }, [reelsStopped, isSpinning, checkWin, reelResults]);

  // Cleanup timeouts on component unmount
  useEffect(() => {
    return () => {
      spinTimeoutRefs.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="relative w-full max-w-sm md:max-w-md bg-gradient-to-br from-slotAccent to-slotBg p-4 rounded-xl shadow-2xl border-4 border-slotFrame">
      <Confetti show={showConfetti} />

      {/* Top Bar - Credits, Level */}
      <div className="flex justify-between items-center mb-4 p-2 bg-slotOffBlack rounded-lg shadow-inner border border-gray-700">
        <div className="text-sm md:text-base font-display text-slotText leading-none">
          CRÉDITOS
          <span className="block text-xl md:text-3xl text-slotBet">
            {credits.toLocaleString()}
          </span>
        </div>
        <div className="text-sm md:text-base font-display text-slotText leading-none">
          NIVEL
          <span className="block text-xl md:text-3xl text-red-500">21</span>
        </div>
      </div>

      {/* Reels Container */}
      <div className="flex space-x-2 md:space-x-4 mb-6">
        {Array.from({ length: NUM_REELS }).map((_, i) => (
          <Reel
            key={i}
            index={i}
            spinning={isSpinning && !reelsStopped[i]}
            result={reelResults[i]}
            onSpinEnd={handleSpinEnd}
            spinDuration={REEL_SPIN_DURATION_MS + i * REEL_STOP_DELAY_MS} // Adjusted duration for staggered stops
          />
        ))}
      </div>

      {/* Bet & Win Display */}
      <div className="flex justify-between items-center mb-6 px-4 py-2 bg-slotOffBlack rounded-lg shadow-inner border border-gray-700">
        <div className="text-sm md:text-lg font-display text-slotText leading-none">
          APUESTA
          <span className="block text-xl md:text-3xl text-slotBet">
            {BET_AMOUNT.toLocaleString()}
          </span>
        </div>
        <div className="text-sm md:text-lg font-display text-slotText leading-none text-right">
          GANANCIA
          <span className={`block text-xl md:text-3xl ${winMessage ? 'text-slotWin' : 'text-gray-400'}`}>
            {winMessage ? '...' : '0'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex space-x-2">
          <Button variant="secondary" className="px-6 py-3 text-lg">PAGOS</Button>
        </div>
        <Button
          variant="spin"
          onClick={spinReels}
          disabled={isSpinning} // Disabled only if spinning, no credit check needed
        >
          SPIN
        </Button>
      </div>

      {winMessage && (
        <div className={`mt-6 p-3 text-center text-lg md:text-xl font-bold font-display rounded-lg shadow-lg ${showConfetti ? 'bg-slotWin text-slotOffBlack' : 'bg-gray-800 text-slotText'}`}>
          {winMessage}
        </div>
      )}
    </div>
  );
};

export default SlotMachine;