
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

  // Genera un conjunto inicial de símbolos para cuando el rodillo no esté girando
  useEffect(() => {
    if (!spinning && displaySymbols.length === 0) {
      const initialSymbols: SymbolName[] = [];
      let lastSymbol: SymbolName | undefined;
      for (let i = 0; i < ALL_SYMBOLS.length * 5; i++) { // Suficientes para que se vea un bucle inicial
        let newSymbol: SymbolName;
        do {
          newSymbol = ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)];
        } while (newSymbol === lastSymbol && ALL_SYMBOLS.length > 1);
        initialSymbols.push(newSymbol);
        lastSymbol = newSymbol;
      }
      setDisplaySymbols(initialSymbols);
      // Intentar centrar el primer símbolo si es el estado inicial
      setCurrentOffset(SYMBOL_HEIGHT * (1 - 0)); 
    }
  }, [spinning, displaySymbols.length]);


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

      // El símbolo 'result' se encuentra ahora en este índice preciso
      const predictableResultIndex = spinSymbols.length + 1; // index of 'result' in newDisplaySymbols

      // Resetear la transición para el salto instantáneo
      setTransitionStyle('none');
      // Saltar muy arriba para iniciar la ilusión de giro rápido.
      // El valor negativo grande asegura que haya muchos símbolos antes de la parada.
      setCurrentOffset(-((predictableResultIndex + 5) * SYMBOL_HEIGHT)); 

      window.setTimeout(() => {
        // Aplicar la transición de frenado: inicio rápido y desaceleración gradual (similar a ease-out-expo)
        setTransitionStyle(`transform ${spinDuration}ms cubic-bezier(0.19, 1, 0.22, 1)`);

        // Calcular el desplazamiento objetivo para centrar el símbolo 'result' (en predictableResultIndex)
        // El borde superior del símbolo en predictableResultIndex debe estar a 1*SYMBOL_HEIGHT del borde superior de la ventana visible.
        const targetOffset = SYMBOL_HEIGHT * (1 - predictableResultIndex);

        // Aplicar un ligero "overshoot" (pasarse un poco) para un frenado más natural y con rebote
        const overshootAmount = SYMBOL_HEIGHT / 4; // Overshoot en 1/4 de la altura del símbolo
        const overshootOffset = targetOffset - overshootAmount; // Ir un poco más allá del objetivo

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
      // Cuando no está girando, asegurar que no hay transición activa para actualizaciones inmediatas
      setTransitionStyle('none');
      // Posicionar el rodillo para mostrar el último resultado centrado
      // Utilizamos `indexOf` ya que la lista `displaySymbols` se actualiza con cada giro
      const resultIndex = displaySymbols.indexOf(result);
      if (resultIndex !== -1) {
          // Calcular el desplazamiento para centrar el símbolo resultante
          const finalOffset = SYMBOL_HEIGHT * (1 - resultIndex);
          setCurrentOffset(finalOffset);
      } else if (displaySymbols.length > 0) {
          // Si por alguna razón el resultado no se encuentra (ej. primer render), centrar el primer símbolo disponible
          setCurrentOffset(SYMBOL_HEIGHT * (1 - 0)); 
      }
    }

    // Limpiar el timeout si el componente se desmonta o el estado de giro cambia
    return () => {
      if (stopAnimationRef.current) {
        clearTimeout(stopAnimationRef.current);
      }
    };
  }, [spinning, result, index, onSpinEnd, spinDuration]); // Se agregó 'result' como dependencia para la generación de símbolos en cada spin

  const reelStyle: React.CSSProperties = {
    transform: `translateY(${currentOffset}px)`,
    transition: transitionStyle,
  };

  return (
    <div
      className="relative w-full h-[300px] overflow-hidden rounded-xl border-4 border-slotFrame shadow-inner"
      style={{
        // Replaced tailwind config access with hardcoded color values.
        // Assuming slotReelBg is a dark grey like #1a1a1a.
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
