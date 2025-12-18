
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
  WIN_CHANCE_PERCENTAGE,
} from '../constants';
import { SymbolName } from '../types';
import { decrementPrize } from '../services/prizeService';

interface SlotMachineProps {
  // credits prop is no longer displayed but still accepted for API consistency if needed elsewhere
  credits: number; 
  onCreditsChange: (newCredits: number) => void; 
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
  const [spinsRemaining, setSpinsRemaining] = useState(5); // New state for remaining spins
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
    if (isSpinning || spinsRemaining === 0) { // Disable if already spinning or no spins left
      return;
    }

    setSpinsRemaining((prev) => prev - 1); // Decrement spins

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
        setTimeout(() => {
          setReelResults((prev) => {
            const newResults = [...prev];
            newResults[i] = finalSymbols[i]; // Provide the target symbol for the reel
            return newResults;
          });
        }, REEL_SPIN_DURATION_MS + stopDelay)
      );
    }
  }, [isSpinning, spinsRemaining]);

  // Effect to handle win/loss outcome once all reels have stopped
  useEffect(() => {
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
          // It's a match, but not a defined prize beer (no pintas)
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
    <div className="relative w-full max-w-sm md:max-w-md bg-gradient-to-br from-slotAccent to-slotBg p-4 rounded-xl shadow-2xl border-4 border-slotFrame flex flex-col items-center">
      <Confetti show={showConfetti} />

      {/* Top Bar - Spins Remaining */}
      <div className="flex justify-center items-center mb-4 p-2 w-full bg-slotOffBlack rounded-lg shadow-inner border border-gray-700">
        <div className="text-sm md:text-base font-display text-slotText leading-none text-center">
          GIROS RESTANTES
          <span className={`block text-xl md:text-3xl ${spinsRemaining === 0 ? 'text-red-500' : 'text-slotWin'}`}>
            {spinsRemaining}
          </span>
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

      {/* Action Buttons */}
      <div className="flex items-center justify-center mt-4 relative"> {/* Centered buttons */}
        <Button
          variant="spin"
          onClick={spinReels}
          disabled={isSpinning || spinsRemaining === 0}
        >
          SPIN
        </Button>
      </div>

      {/* Messages and Recharge button */}
      {spinsRemaining === 0 && !isSpinning && (
        <div className="flex flex-col items-center w-full">
          <div className="mt-6 p-3 text-center text-lg md:text-xl font-bold font-display rounded-lg shadow-lg bg-red-800 text-white w-full">
            ¡No tienes giros! Recarga para seguir jugando.
          </div>
          <Button
            variant="admin" 
            onClick={() => {
              setSpinsRemaining(5);
              setWinMessage(null); 
              setShowConfetti(false); 
            }}
            fullWidth={true}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black" 
          >
            RECARGAR GIROS
          </Button>
        </div>
      )}
      {winMessage && !isSpinning && ( 
        <div className={`mt-6 p-3 text-center text-lg md:text-xl font-bold font-display rounded-lg shadow-lg ${showConfetti ? 'bg-slotWin text-slotOffBlack' : 'bg-gray-800 text-slotText'} w-full`}>
          {winMessage}
        </div>
      )}
    </div>
  );
};

export default SlotMachine;