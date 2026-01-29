import React, { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { POST_LOGIN_REDIRECT_KEY } from '../constants/auth';
import { useAuth } from '../contexts/useAuth';
import { useI18n } from '../i18n';

const AuthCallbackPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { completeLogin } = useAuth();
  const { t } = useI18n();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [messageKey, setMessageKey] = useState('authCallback.loadingMessage');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const refreshToken = params.get('refresh_token');
    const fallback = params.get('redirect') || params.get('state') || '/';

    if (!token) {
      setStatus('error');
      setMessageKey('authCallback.missingToken');
      return;
    }

    completeLogin({ accessToken: token, refreshToken })
      .then(() => {
        setStatus('success');
        setMessageKey('authCallback.successMessage');

        const redirectTarget =
          (typeof window !== 'undefined' && sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY)) ||
          fallback ||
          '/';

        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
        }

        setTimeout(() => {
          navigate(redirectTarget, { replace: true });
        }, 750);
      })
      .catch(() => {
        setStatus('error');
        setMessageKey('authCallback.errorMessage');
      });
  }, [completeLogin, location.search, navigate]);

  const renderIcon = () => {
    if (status === 'loading') {
      return <Loader2 className="w-10 h-10 text-red-500 animate-spin" />;
    }
    if (status === 'success') {
      return <ShieldCheck className="w-10 h-10 text-green-500" />;
    }
    return <ShieldAlert className="w-10 h-10 text-red-500" />;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-rose-50 to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-white/60 dark:border-gray-800 p-10 text-center">
        <div className="flex justify-center mb-6">{renderIcon()}</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {status === 'error' ? t('authCallback.title.error') : t('authCallback.title.success')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">{t(messageKey)}</p>

        {status === 'error' && (
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="w-full py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              {t('authCallback.button.backToLogin')}
            </button>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="w-full py-3 border border-gray-200 dark:border-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {t('authCallback.button.home')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;
