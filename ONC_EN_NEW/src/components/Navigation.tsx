import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Icon from './ui/Icon';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-engineering shadow-engineering-lg border-b border-slate-700/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center mr-2 shadow-sm">
                <img 
                  src="/logo.png" 
                  alt="Enstructura Logo" 
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    maxWidth: '40px', 
                    maxHeight: '40px',
                    objectFit: 'contain'
                  }}
                  className="block"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Enstructura Consultants
                </h1>
                <p className="text-xs text-blue-200 font-medium">
                  Structural Analysis Platform
                </p>
              </div>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-2">
              <Link
                to="/input"
                className={`inline-flex items-center px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-lg ${
                  isActive('/input')
                    ? 'bg-white text-slate-700 shadow-lg transform scale-105'
                    : 'text-blue-100 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm'
                }`}
              >
                New Assessment
              </Link>
              <Link
                to="/history"
                className={`inline-flex items-center px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-lg ${
                  isActive('/history')
                    ? 'bg-white text-slate-700 shadow-lg transform scale-105'
                    : 'text-blue-100 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm'
                }`}
              >
                Report History
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg text-blue-100 hover:text-white hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/20 transition-all duration-200 hover:backdrop-blur-sm"
            >
              Logout
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/20"
            >
              <Icon name="grid" size="md" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu - you can expand this later */}
      <div className="sm:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 bg-slate-800/50 backdrop-blur-sm">
          <Link
            to="/input"
            className={`flex items-center px-3 py-2 text-base font-medium rounded-lg ${
              isActive('/input')
                ? 'bg-white text-slate-700'
                : 'text-blue-100 hover:text-white hover:bg-white/10'
            }`}
          >
            New Assessment
          </Link>
          <Link
            to="/history"
            className={`flex items-center px-3 py-2 text-base font-medium rounded-lg ${
              isActive('/history')
                ? 'bg-white text-slate-700'
                : 'text-blue-100 hover:text-white hover:bg-white/10'
            }`}
          >
            Report History
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-base font-medium rounded-lg text-blue-100 hover:text-white hover:bg-red-500/20"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;