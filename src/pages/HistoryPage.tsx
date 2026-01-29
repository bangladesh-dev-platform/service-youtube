import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import { videoPortalApi, HistoryRecord } from '../services/videoPortalApi';
import { convertPortalVideoToVideo, formatRelativeDate } from '../utils/videoUtils';
import { Video } from '../types';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useI18n } from '../i18n';

interface HistoryItem {
  video: Video;
  history: HistoryRecord['history'];
}

const HistoryPage: React.FC = () => {
  const { isAuthenticated, login, accessToken } = useAuth();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!isAuthenticated || !accessToken) {
        setItems([]);
        return;
      }

      setLoading(true);
      try {
        const response = await videoPortalApi.listHistory(accessToken, { limit: 50 });
        const mapped = response.items.map(record => ({
          video: convertPortalVideoToVideo(record.video),
          history: record.history,
        }));
        setItems(mapped);
      } catch (error) {
        console.error('Failed to load history', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [accessToken, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold mb-3">{t('history.signInTitle')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{t('history.signInSubtitle')}</p>
        <button
          onClick={() => login('/history')}
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
          <h1 className="text-2xl font-bold">{t('history.heading')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('history.subtitle')}</p>
        </div>
      </div>

      {items.length === 0 && !loading ? (
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-2">{t('history.empty')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('history.emptyDetail')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(({ video, history }) => (
            <Link
              to={`/watch/${video.id}`}
              key={history.id}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 dark:bg-gray-800/70 border border-gray-100 dark:border-gray-800 hover:border-red-200 dark:hover:border-red-400/40 transition-colors"
            >
              <div className="w-48 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {video.channelName || t('viewer.channelFallback')} • {video.views ? `${video.views} ${t('viewer.viewsLabel')} • ` : ''}
                  {video.uploadDate || t('viewer.justNow')}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <Clock size={14} />
                  <span>{t('history.lastWatched', { time: formatRelativeDate(history.last_watched_at) })}</span>
                  {history.last_position_seconds > 0 && (
                    <span className="ml-2">{t('history.pausedAt', { time: `${Math.floor(history.last_position_seconds / 60)}m` })}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
