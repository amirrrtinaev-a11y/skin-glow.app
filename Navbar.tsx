import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import { Sparkles, User as UserIcon, LogOut, Package } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-rose-500 p-1.5 rounded-lg text-white">
              <Sparkles size={20} />
            </div>
            <span className="text-xl font-bold text-stone-800 tracking-tight">SkinGlow AI</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link 
                  to="/diagnostics" 
                  className="hidden md:block text-sm font-medium text-stone-600 hover:text-rose-500 transition-colors"
                >
                  Новый подбор
                </Link>
                
                <Link 
                  to="/dashboard" 
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-stone-100 text-stone-700 transition-colors"
                >
                  <Package size={18} />
                  {/* Make text visible always */}
                  <span className="font-medium text-sm">Мои боксы</span>
                </Link>

                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="text-sm font-medium text-rose-600 hover:text-rose-700 hidden sm:block"
                  >
                    Админка
                  </Link>
                )}

                <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                  <div className="text-xs text-stone-500 hidden sm:block text-right">
                    <div>{user.name}</div>
                    <div className="text-[10px] uppercase">{user.role}</div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                    title="Выйти"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 transition-colors"
              >
                <UserIcon size={16} />
                Войти
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;