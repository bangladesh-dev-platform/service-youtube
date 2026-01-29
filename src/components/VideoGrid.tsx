import React, { useEffect, useRef } from 'react';
import VideoCard from './VideoCard';
import { Video } from '../types';
import { useI18n } from '../i18n';

interface VideoGridProps {
  videos: Video[];
  loading?: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

const VideoGrid: React.FC<VideoGridProps> = ({ videos, loading = false, hasMore = false, isLoadingMore = false, onLoadMore }) => {
  const { t } = useI18n();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || !onLoadMore) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting && !isLoadingMore && !loading) {
          onLoadMore();
        }
      },
      { rootMargin: '200px' }
    );

    const node = loadMoreRef.current;
    if (node) observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
      observer.disconnect();
    };
  }, [hasMore, onLoadMore, isLoadingMore, loading]);

  const isInitialLoading = loading && videos.length === 0;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {isInitialLoading
          ? Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-300 dark:bg-gray-700 aspect-video rounded-xl"></div>
                <div className="mt-3 flex gap-3">
                  <div className="w-9 h-9 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))
          : videos.map(video => <VideoCard key={video.id} video={video} />)}
      </div>

      {hasMore && onLoadMore && (
        <div className="pb-12 flex flex-col items-center gap-3">
          <div ref={loadMoreRef} className="h-1 w-full"></div>
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-5 py-2 rounded-full border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoadingMore ? t('home.loadingMore') : t('home.loadMore')}
          </button>
        </div>
      )}
    </>
  );
};

export default VideoGrid;
