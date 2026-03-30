import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { getThemePreference, setThemePreference } from './services/storageManager';
import { Sun, Moon, Settings, BookOpen } from 'lucide-react';
import ChapterSelection from './components/ChapterSelection';
import ShlokViewer from './components/ShlokViewer';
import './App.css';

function AppContent() {
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await getThemePreference();
      if (savedTheme) {
        setIsDark(savedTheme === 'dark');
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDark(prefersDark);
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newDark = !isDark;
    setIsDark(newDark);
    const themeStr = newDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', themeStr);
    await setThemePreference(newDark);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="logo gradient-text" onClick={() => navigate('/')}>
          <BookOpen className="logo-icon" />
          Bhagavad Gita
        </h1>
        <div className="header-actions">
          <button className="icon-button" onClick={toggleTheme} aria-label="Toggle Theme">
            {isDark ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      </header>
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ChapterSelection />} />
          <Route path="/read" element={<ShlokViewer />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
