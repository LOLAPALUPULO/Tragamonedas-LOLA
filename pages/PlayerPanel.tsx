
import React, { useState, useCallback } from 'react';
import SlotMachine from '../components/SlotMachine';

const PlayerPanel: React.FC = () => {
  // Credits are now purely cosmetic and not displayed in SlotMachine. 
  // We can keep it high or even remove it if SlotMachine didn't expect the prop.
  // For consistency, pass a dummy high value.
  const [credits, setCredits] = useState<number>(999999999);

  // This function is still passed but effectively does nothing, as credits are not managed.
  const onCreditsChange = useCallback((newCredits: number) => {
    // No actual credit management needed for this version of the game.
    setCredits(999999999); // Ensure credits always appear high if they were ever re-introduced.
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <SlotMachine credits={credits} onCreditsChange={onCreditsChange} />
    </div>
  );
};

export default PlayerPanel;