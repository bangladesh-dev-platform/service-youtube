import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Play, Shield } from 'lucide-react';
import { useAuth } from '../contexts/useAuth';
import { AUTH_UI_BASE_URL } from '../config/env';
import { useI18n } from '../i18n';

const LoginPage: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirectParam = params.get('redirect');

  const redirectTarget = useMemo(() => {
    if (!redirectParam) return '/';
    return redirectParam.startsWith('/') ? redirectParam : '/';
  }, [redirectParam]);

  const { login } = useAuth();
  const { t } = useI18n();
  const loginHighlights = ['login.highlight.singleRedirect', 'login.highlight.refresh', 'login.highlight.mfa'] as const;

  const registerUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return `${AUTH_UI_BASE_URL.replace(/\/$/, '')}/register.html`;
    }

    const base = AUTH_UI_BASE_URL.endsWith('/') ? AUTH_UI_BASE_URL : `${AUTH_UI_BASE_URL}/`;
    const url = new URL('register.html', base);
    url.searchParams.set('redirect_url', `${window.location.origin}/auth/callback`);

    if (redirectTarget && redirectTarget !== '/') {
      url.searchParams.set('state', redirectTarget);
    }

    return url.toString();
  }, [redirectTarget]);

  const handleRedirect = () => {
    login(redirectTarget);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Play size={24} className="text-white" fill="currentColor" />
            </div>
            <span className="font-bold text-2xl text-gray-900 dark:text-white">
              {t('app.name')}
            </span>
          </Link>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('login.tagline')}
          </p>
        </div>

        {/* SSO Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-200 text-sm font-medium">
              <Shield size={16} className="mr-2" /> {t('login.badge')}
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('login.heading')}</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('login.description')}
            </p>
          </div>

          <div className="space-y-4">
            {loginHighlights.map((key) => (
              <div key={key} className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>{t(key)}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleRedirect}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium rounded-lg hover:from-red-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
          >
            <span>{t('login.cta')}</span>
            <ArrowRight size={18} />
          </button>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            {t('login.needAccount')}{' '}
            <a href={registerUrl} className="text-red-500 hover:text-red-600 font-medium" target="_blank" rel="noreferrer">
              {t('login.createAccount')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
