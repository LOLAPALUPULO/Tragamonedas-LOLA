
import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import PlayerPanel from './pages/PlayerPanel';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slotBg to-slotOffBlack font-sans relative">
        <nav className="absolute top-4 left-4 right-4 flex justify-between p-2 rounded-lg bg-gray-800 bg-opacity-70 z-50 shadow-lg">
          <Link
            to="/"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-md text-sm md:text-base"
          >
            Jugador
          </Link>
          <Link
            to="/admin"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-md text-sm md:text-base"
          >
            Admin
          </Link>
        </nav>

        <main className="flex-grow flex items-center justify-center w-full max-w-full lg:max-w-4xl pt-20 pb-4">
          <Routes>
            <Route path="/" element={<PlayerPanel />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;