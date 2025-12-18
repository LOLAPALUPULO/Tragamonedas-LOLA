
import React, { useState, useEffect, useCallback } from 'react';
import Button from '../components/Button';
import { PRIZE_BEERS } from '../constants';
import { getPrizeCounts, setPrizeCounts, resetPrizeCounts } from '../services/prizeService';
import { PrizeCounts, SymbolName } from '../types';
import AdminLogin from '../components/AdminLogin'; // Import the new login component

const AdminPanel: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    sessionStorage.getItem('isAdminLoggedIn') === 'true'
  );
  const [prizeAmounts, setPrizeAmounts] = useState<PrizeCounts>(getPrizeCounts());
  const [message, setMessage] = useState<string | null>(null);

  // Memoize updatePrizeAmounts to prevent unnecessary re-renders
  const updatePrizeAmounts = useCallback(() => {
    setPrizeAmounts(getPrizeCounts());
  }, []);

  useEffect(() => {
    // Only update prize amounts if logged in
    if (isLoggedIn) {
      updatePrizeAmounts();
    }
  }, [isLoggedIn, updatePrizeAmounts]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setMessage('Acceso de administrador concedido.');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isAdminLoggedIn');
    setIsLoggedIn(false);
    setMessage('Sesión de administrador cerrada.');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleInputChange = (beerName: SymbolName, value: string) => {
    const amount = parseInt(value, 10);
    setPrizeAmounts(prev => ({
      ...prev,
      [beerName]: isNaN(amount) ? 0 : Math.max(0, amount), // Ensure non-negative numbers
    }));
  };

  const handleSavePrizes = () => {
    setPrizeCounts(prizeAmounts);
    setMessage('Cantidades de premios guardadas con éxito.');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleResetPrizes = () => {
    if (window.confirm('¿Estás seguro de que quieres reiniciar todos los premios a cero?')) {
      resetPrizeCounts();
      updatePrizeAmounts();
      setMessage('Todos los premios han sido reiniciados a cero.');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (!isLoggedIn) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="w-full max-w-md md:max-w-lg bg-gray-800 p-6 rounded-xl shadow-2xl border-4 border-slotFrame text-white relative">
      <div className="absolute top-4 right-4 z-10">
        <Button variant="secondary" onClick={handleLogout} className="text-xs py-1 px-3 bg-red-600 hover:bg-red-700">
          Cerrar Sesión
        </Button>
      </div>

      <h2 className="text-3xl font-display text-center text-slotText mb-6">Panel de Administración de Premios</h2>

      {message && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fadeInOut z-20">
          {message}
        </div>
      )}

      <div className="space-y-4 mb-8">
        {PRIZE_BEERS.map((beerName) => (
          <div key={beerName} className="flex flex-col md:flex-row items-center justify-between p-3 bg-gray-700 rounded-lg shadow-inner">
            <label htmlFor={beerName} className="text-lg md:text-xl font-bold text-gray-200 mb-2 md:mb-0 md:mr-4 w-full md:w-auto">
              {(beerName as string).replace('_', ' ')}:
            </label>
            <input
              id={beerName}
              type="number"
              min="0"
              value={prizeAmounts[beerName] || 0}
              onChange={(e) => handleInputChange(beerName, e.target.value)}
              className="w-full md:w-32 p-2 rounded-md bg-gray-900 text-slotText border border-gray-600 focus:ring-2 focus:ring-purple-500 text-center font-bold"
              aria-label={`Cantidad de ${(beerName as string).replace('_', ' ')}`}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-around space-y-4 md:space-y-0 md:space-x-4">
        <Button variant="admin" onClick={handleSavePrizes} fullWidth={true}>
          Guardar Cantidades
        </Button>
        <Button variant="secondary" onClick={handleResetPrizes} fullWidth={true}>
          Reiniciar Todo a Cero
        </Button>
      </div>
    </div>
  );
};

export default AdminPanel;