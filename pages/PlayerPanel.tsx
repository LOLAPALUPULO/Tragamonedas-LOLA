
import React, { useState, useEffect, useCallback } from 'react';
import SlotMachine from '../components/SlotMachine';
// No longer import INITIAL_CREDITS as it's effectively infinite

const PlayerPanel: React.FC = () => {
  // Set credits to a very high number to simulate infinite play (no payment)
  const [credits, setCredits] = useState<number>(999999999);

  // onCreditsChange is now cosmetic, as credits are infinite and not managed by storage
  const onCreditsChange = useCallback((newCredits: number) => {
    // We can still update the state if we want to show a 'deduction' but not persist it
    // For free play, we simply don't do anything with the newCredits or keep them high
    setCredits(999999999); // Always reset to max for visual consistency
  }, []);

  // Removed useEffect for localStorage credit storage as credits are now static/infinite.

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <SlotMachine credits={credits} onCreditsChange={onCreditsChange} />
    </div>
  );
};

export default PlayerPanel;