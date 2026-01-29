import React, { useState } from 'react';
import { MoreVertical, Clock, Eye, Play } from 'lucide-react';
import { Video } from '../types';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

interface VideoCardProps {
  video: Video;
  isHorizontal?: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, isHorizontal = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { t } = useI18n();

  const handleImageError = () => {
    setImageError(true);
  };

  const getThumbnailUrl = () => {
    if (imageError) {
      return `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
    }
    return video.thumbnail || `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
  };

  const channelInitial = (video.channelName || 'S')[0]?.toUpperCase() ?? 'S';
  const channelLabel = video.channelName || t('viewer.channelFallback');
  const viewsLabel = video.views ? `${video.views} ${t('viewer.viewsLabel')}` : null;
  const uploadDateLabel = video.uploadDate || t('viewer.justNow');

  if (isHorizontal) {
    return (
      <div className="flex gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
        <div className="relative flex-shrink-0">
          <Link to={`/watch/${video.id}`}>
            <div className="relative w-40 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              <img
                src={getThumbnailUrl()}
                alt={video.title}
                className="w-full h-full object-cover"
                onError={handleImageError}
                loading="lazy"
              />
              {video.duration && video.duration !== 'N/A' && (
                <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 py-0.5 rounded">
                  {video.duration}
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                <Play size={24} className="text-white opacity-0 hover:opacity-100 transition-opacity" fill="currentColor" />
              </div>
            </div>
          </Link>
        </div>
        <div className="flex-1 min-w-0">
          <Link to={`/watch/${video.id}`}>
            <h3 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 hover:text-red-600 dark:hover:text-red-400 transition-colors leading-tight">
              {video.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-600 dark:text-gray-400">
             <span className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
               {channelLabel}
             </span>
             {viewsLabel && (
               <>
                  <span>•</span>
                  <span>{viewsLabel}</span>
                </>
              )}
             <span>•</span>
             <span>{uploadDateLabel}</span>
          </div>
        </div>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <MoreVertical size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <Link to={`/watch/${video.id}`}>
          <div className="relative overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700 aspect-video">
            <img
              src={getThumbnailUrl()}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={handleImageError}
              loading="lazy"
            />
            {video.duration && video.duration !== 'N/A' && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded-md">
                {video.duration}
              </div>
            )}
            {isHovered && (
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center transition-all duration-200">
                <div className="w-16 h-16 bg-red-500 bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all">
                  <Play size={24} className="text-white ml-1" fill="currentColor" />
                </div>
              </div>
            )}
          </div>
        </Link>
      </div>

      <div className="mt-3">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">
                {channelInitial}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <Link to={`/watch/${video.id}`}>
              <h3 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 hover:text-red-600 dark:hover:text-red-400 transition-colors leading-tight">
                {video.title}
              </h3>
            </Link>
            <div className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mt-1 cursor-pointer">
              {channelLabel}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
              {viewsLabel && (
                <>
                  <Eye size={14} />
                  <span>{viewsLabel}</span>
                  <span>•</span>
                </>
              )}
              <span>{uploadDateLabel}</span>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical size={16} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Clock size={16} className="inline mr-2" />
                  {t('video.menu.watchLater')}
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  {t('video.menu.playlist')}
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  {t('viewer.share')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
