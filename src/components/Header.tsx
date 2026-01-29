import React, { useState } from 'react';
import { Search, Menu, User, Moon, Sun, Bell, Settings, Languages } from 'lucide-react';
import { useTheme } from '../contexts/useTheme';
import { useAuth } from '../contexts/useAuth';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n';

interface HeaderProps {
  onSearch: (query: string) => void;
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onMenuToggle }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const { lang, setLang, t } = useI18n();

  const currentPath = `${location.pathname}${location.search}` || '/';
  const loginTarget = location.pathname === '/login' ? '/login' : `/login?redirect=${encodeURIComponent(currentPath)}`;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
            >
              <Menu size={20} />
            </button>
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SV</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white hidden sm:block">
                {t('app.name')}
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                className="w-full px-4 py-2 pl-10 pr-4 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            <div className="relative" onMouseLeave={() => setShowLangMenu(false)}>
              <button
                onClick={() => setShowLangMenu(prev => !prev)}
                className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium"
              >
                <Languages size={16} />
                {lang === 'bn' ? t('lang.name.bn') : t('lang.name.en')}
              </button>
              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                  {(['bn', 'en'] as const).map(code => (
                    <button
                      key={code}
                      onClick={() => {
                        setLang(code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm ${lang === code ? 'bg-red-50 text-red-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                      {code === 'bn' ? t('lang.name.bn') : t('lang.name.en')}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={isDark ? t('theme.toggle.light') : t('theme.toggle.dark')}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {isAuthenticated ? (
              <>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Bell size={20} />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <img
                      src={user?.avatar}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User size={16} className="mr-3" />
                        {t('nav.profile')}
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings size={16} className="mr-3" />
                        {t('nav.settings')}
                      </Link>
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {t('nav.signOut')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to={loginTarget}
                 className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                {t('cta.login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
