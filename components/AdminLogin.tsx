
import React, { useState } from 'react';
import Button from './Button';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (password === 'tanogerman') {
      sessionStorage.setItem('isAdminLoggedIn', 'true'); // Persist login status
      onLoginSuccess();
    } else {
      setError('Contraseña incorrecta');
      setPassword(''); // Clear password field on error
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-sm bg-gray-800 p-8 rounded-xl shadow-2xl border-4 border-slotFrame text-white">
      <h2 className="text-3xl font-display text-center text-slotText mb-6">Acceso de Administrador</h2>
      <input
        type="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setError(''); // Clear error on new input
        }}
        onKeyPress={handleKeyPress}
        placeholder="Introduce la contraseña"
        className="w-full p-3 mb-4 rounded-md bg-gray-900 text-slotText border border-gray-600 focus:ring-2 focus:ring-purple-500 text-center font-bold text-lg"
        aria-label="Contraseña de administrador"
      />
      {error && <p className="text-red-500 mb-4 font-bold" role="alert">{error}</p>}
      <Button variant="admin" onClick={handleLogin} fullWidth={true}>
        Ingresar
      </Button>
    </div>
  );
};

export default AdminLogin;