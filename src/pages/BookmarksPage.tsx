import React from 'react';
import VideoGrid from '../components/VideoGrid';
import { useBookmarks } from '../contexts/useBookmarks';
import { useAuth } from '../contexts/useAuth';
import { useI18n } from '../i18n';

const BookmarksPage: React.FC = () => {
  const { bookmarks, loading } = useBookmarks();
  const { isAuthenticated, login } = useAuth();
  const { t } = useI18n();

  if (!isAuthenticated) {
    return (
      <div className="px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold mb-3">{t('bookmarks.signInTitle')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{t('bookmarks.signInSubtitle')}</p>
        <button
          onClick={() => login('/bookmarks')}
          className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
        >
          {t('cta.login')}
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('bookmarks.heading')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('bookmarks.subtitle')}</p>
        </div>
      </div>

      {bookmarks.length === 0 && !loading ? (
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-2">{t('bookmarks.empty')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('bookmarks.emptyDetail')}</p>
        </div>
      ) : (
        <VideoGrid videos={bookmarks} loading={loading} />
      )}
    </div>
  );
};

export default BookmarksPage;
