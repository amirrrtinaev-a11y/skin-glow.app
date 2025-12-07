import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { User } from './types';
import { storage } from './services/storage';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Diagnostics from './pages/Diagnostics';
import Results from './pages/Results';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Login from './pages/Login';

// Context
interface AppContextType {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = storage.getCurrentUser();
    if (currentUser) setUser(currentUser);
  }, []);

  const login = (email: string) => {
    const newUser = storage.login(email);
    setUser(newUser);
  };

  const logout = () => {
    storage.logout();
    setUser(null);
  };

  return (
    <AppContext.Provider value={{ user, login, logout }}>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-rose-50 via-stone-50 to-teal-50">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/diagnostics" 
                element={user ? <Diagnostics /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/results" 
                element={user ? <Results /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/dashboard" 
                element={user ? <Dashboard /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/admin" 
                element={user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} 
              />
            </Routes>
          </main>
          <footer className="bg-stone-900 text-stone-400 py-8 text-center text-sm">
            <p>&copy; 2024 SkinGlow AI. Персональный подход к красоте.</p>
          </footer>
        </div>
      </Router>
    </AppContext.Provider>
  );
};

export default App;