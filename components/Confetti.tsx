
import React from 'react';

interface ConfettiProps {
  show: boolean;
}

const Confetti: React.FC<ConfettiProps> = ({ show }) => {
  if (!show) return null;

  // Generate a few confetti pieces with random colors and positions
  const confettiPieces = Array.from({ length: 50 }).map((_, i) => (
    <div
      key={i}
      className="absolute bg-white w-2 h-2 rounded-full opacity-0 animate-confetti"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        backgroundColor: `hsl(${Math.random() * 360}, 100%, 75%)`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${3 + Math.random() * 2}s`,
        transform: `rotate(${Math.random() * 360}deg)`,
      }}
    />
  ));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
      {confettiPieces}
    </div>
  );
};

export default Confetti;
