import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import Crops from './pages/Crops';
import Irrigation from './pages/Irrigation';
import Team from './pages/Team';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
          <Navbar />
          <main className="max-w-7xl mx-auto pt-4 pb-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/crops" element={<Crops />} />
              <Route path="/irrigation" element={<Irrigation />} />
              <Route path="/team" element={<Team />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;