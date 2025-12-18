
import React, { useRef, useEffect, useState } from 'react';
import { SymbolName } from '../types';
import { SYMBOL_IMAGES, SYMBOL_HEIGHT, ALL_SYMBOLS } from '../constants';

interface ReelProps {
  index: number;
  spinning: boolean;
  result: SymbolName;
  onSpinEnd: (index: number, finalSymbol: SymbolName) => void;
  spinDuration: number;
}

const Reel: React.FC<ReelProps> = ({
  index,
  spinning,
  result,
  onSpinEnd,
  spinDuration,
}) => {
  const reelRef = useRef<HTMLDivElement>(null);
  const [displaySymbols, setDisplaySymbols] = useState<SymbolName[]>([]);
  const [currentOffset, setCurrentOffset] = useState(0); // For CSS transform
  const [transitionStyle, setTransitionStyle] = useState('none'); // Manages CSS transition property
  const stopAnimationRef = useRef<number | null>(null); // To store timeout ID

  // This useEffect handles the very initial display of symbols when the component mounts
  // and is not spinning. It ensures 3 symbols are visible with the 'result' symbol in the middle.
  useEffect(() => {
    if (!spinning && displaySymbols.length === 0) {
      // Generate a default 3-symbol sequence to ensure the reel is visually full
      let tempResult = result; // Use the initial result passed from parent (ALL_SYMBOLS[0])
      
      let symbolAbove = ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)];
      while (symbolAbove === tempResult && ALL_SYMBOLS.length > 1) {
          symbolAbove = ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)];
      }
      let symbolBelow = ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)];
      while (symbolBelow === tempResult && ALL_SYMBOLS.length > 1) {
          symbolBelow = ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)];
      }
      // The initial state for `displaySymbols` should be just these three to control positioning easily
      setDisplaySymbols([symbolAbove, tempResult, symbolBelow]);
      // We want the `tempResult` (index 1) to be centered. This means its top should be at SYMBOL_HEIGHT.
      // So, the top of the symbol at index 0 (`symbolAbove`) should be at 0.
      setCurrentOffset(0); // This places symbolAbove at Y=0, tempResult at Y=100 (centered)
    }
  }, [spinning, displaySymbols.length, result]); // Dependencies, important for re-evaluation


  useEffect(() => {
    if (spinning) {
      if (stopAnimationRef.current) {
        clearTimeout(stopAnimationRef.current);
        stopAnimationRef.current = null;
      }

      // 1. Generar símbolos aleatorios para la parte del "giro rápido"
      const spinSymbols: SymbolName[] = [];
      let lastSpinSymbol: SymbolName | undefined;
      // Generar una lista larga de símbolos para la ilusión de giro
      for (let i = 0; i < ALL_SYMBOLS.length * 10; i++) { // Aproximadamente 80-120 símbolos
        let newSymbol: SymbolName;
        do {
          newSymbol = ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)];
        } while (newSymbol === lastSpinSymbol && ALL_SYMBOLS.length > 1);
        spinSymbols.push(newSymbol);
        lastSpinSymbol = newSymbol;
      }

      // 2. Crear la secuencia final de parada: [símbolo_arriba, result, símbolo_abajo]
      // Esto asegura que 'result' estará en una posición predecible
      let symbolAbove = ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)];
      while (symbolAbove === result && ALL_SYMBOLS.length > 1) { // Evitar que sea el mismo que el resultado
        symbolAbove = ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)];
      }

      let symbolBelow = ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)];
      while (symbolBelow === result && ALL_SYMBOLS.length > 1) { // Evitar que sea el mismo que el resultado
        symbolBelow = ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)];
      }
      
      const stoppingSequence = [symbolAbove, result, symbolBelow];

      // Combinar para obtener la tira completa de símbolos
      const newDisplaySymbols = [...spinSymbols, ...stoppingSequence];
      setDisplaySymbols(newDisplaySymbols);

      // Calcular el desplazamiento objetivo para posicionar `result` (que está en `stoppingSequence[1]`)
      // en el centro del visor. Esto significa que `symbolAbove` (que está en `stoppingSequence[0]`)
      // debe estar alineado con la parte superior del visor (y=0).
      // El índice de `symbolAbove` en la lista `newDisplaySymbols` es `spinSymbols.length`.
      const targetIndexForTop = spinSymbols.length; 
      const targetOffset = -(targetIndexForTop * SYMBOL_HEIGHT);

      // Resetear la transición para el salto instantáneo
      setTransitionStyle('none');
      // Saltar muy arriba para iniciar la ilusión de giro rápido.
      // Restamos una gran cantidad de altura para que haya muchos símbolos antes de la parada.
      setCurrentOffset(targetOffset - (ALL_SYMBOLS.length * 5 * SYMBOL_HEIGHT)); 

      window.setTimeout(() => {
        // Aplicar la transición de frenado: inicio rápido y desaceleración gradual (similar a ease-out-expo)
        setTransitionStyle(`transform ${spinDuration}ms cubic-bezier(0.19, 1, 0.22, 1)`);

        // Aplicar un ligero "overshoot" (pasarse un poco) para un frenado más natural y con rebote
        const overshootAmount = SYMBOL_HEIGHT / 4; // Overshoot en 1/4 de la altura del símbolo
        const overshootOffset = targetOffset + overshootAmount; // Ir un poco más allá del objetivo (hacia abajo)

        // Iniciar la animación principal de frenado hacia el punto de overshoot
        setCurrentOffset(overshootOffset);

        // Programar la animación de "spring-back" (rebote)
        stopAnimationRef.current = window.setTimeout(() => {
          // Transición de rebote: ease-out-back para un efecto elástico
          setTransitionStyle(`transform 300ms cubic-bezier(0.17, 0.89, 0.32, 1.49)`);
          setCurrentOffset(targetOffset); // Volver a la posición final exacta

          // Escuchar el final de la transición de rebote para señalar la finalización
          const reelElement = reelRef.current;
          if (reelElement) {
            const animationEndHandler = () => {
              reelElement.removeEventListener('transitionend', animationEndHandler);
              onSpinEnd(index, result);
            };
            reelElement.addEventListener('transitionend', animationEndHandler, { once: true });
          }
        }, spinDuration - 300); // Activar el rebote 300ms antes de que termine la duración total del giro

      }, 50); // Pequeño retraso inicial para aplicar el `transition: none` antes de iniciar la animación

    } else {
      // Cuando no está girando, asegurar que no hay transición activa para actualizaciones inmediatas.
      // `currentOffset` debe estar en su posición final animada cuando `spinning` se vuelve falso.
      setTransitionStyle('none');
    }

    // Limpiar el timeout si el componente se desmonta o el estado de giro cambia
    return () => {
      if (stopAnimationRef.current) {
        clearTimeout(stopAnimationRef.current);
      }
    };
  }, [spinning, result, index, onSpinEnd, spinDuration, displaySymbols.length]); 

  const reelStyle: React.CSSProperties = {
    transform: `translateY(${currentOffset}px)`,
    transition: transitionStyle,
  };

  return (
    <div
      className="relative w-full h-[300px] overflow-hidden rounded-xl border-4 border-slotFrame shadow-inner"
      style={{
        background: `repeating-linear-gradient(-45deg, #1a1a1a 0%, #1a1a1a 50%, #333 100%)`, // Subtle dark background for reels
      }}
    >
      {/* Payline indicator */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 border-t-2 border-b-2 border-slotIndicator z-10 animate-blink"></div>

      <div
        ref={reelRef}
        className="absolute inset-0 flex flex-col justify-start items-center"
        style={reelStyle}
      >
        {displaySymbols.map((symbol, i) => (
          <div
            key={`${index}-${i}-${symbol}`}
            className="w-full h-[100px] flex items-center justify-center p-2 box-border"
          >
            <img
              src={SYMBOL_IMAGES[symbol]}
              alt={symbol}
              className="max-w-[80px] max-h-[80px] object-contain drop-shadow-md"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reel;