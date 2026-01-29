import React from 'react';
import { Home, TrendingUp, PlaySquare, Settings, Bookmark, History } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { useI18n } from '../i18n';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();

  const menuItems = [
    { icon: Home, label: t('nav.home'), path: '/' },
    { icon: TrendingUp, label: t('nav.trending'), path: '/trending' },
    { icon: PlaySquare, label: t('nav.subscriptions'), path: '/subscriptions', auth: true },
  ];

  const libraryItems = [
    { icon: Bookmark, label: t('nav.bookmarks'), path: '/bookmarks', auth: true },
    { icon: History, label: t('nav.history'), path: '/history', auth: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:transform-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-4">
            {/* Main Navigation */}
            <nav className="px-3 space-y-1">
              {menuItems.map((item) => {
                if (item.auth && !isAuthenticated) return null;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <item.icon size={20} className="mr-3" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Library Section */}
            {isAuthenticated && (
              <>
                <div className="px-6 py-3 mt-6">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('sidebar.library')}
                  </h3>
                </div>
                <nav className="px-3 space-y-1">
                  {libraryItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive(item.path)
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <item.icon size={20} className="mr-3" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </>
            )}

            {/* Categories */}
            <div className="px-6 py-3 mt-6">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('sidebar.explore')}
              </h3>
            </div>
            <nav className="px-3 space-y-1">
              {[
                t('category.music'),
                t('category.gaming'),
                t('category.news'),
                t('category.sports'),
                t('category.education'),
              ].map((category, index) => (
                <Link
                  key={category}
                  to={`/category/${['music','gaming','news','sports','education'][index]}`}
                  onClick={onClose}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {category}
                </Link>
              ))}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              to="/settings"
              onClick={onClose}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Settings size={20} className="mr-3" />
              {t('nav.settings')}
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
