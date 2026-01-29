import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal, Bell, Bookmark, BookmarkCheck } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import YouTubePlayer from '../components/YouTubePlayer';
import { useVideoDetails, useRelatedVideos } from '../hooks/useYouTubeData';
import { useAuth } from '../contexts/useAuth';
import { useBookmarks } from '../contexts/useBookmarks';
import { videoPortalApi } from '../services/videoPortalApi';
import CommentsSection from '../components/CommentsSection';
import { useI18n } from '../i18n';

const VideoPlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [showDescription, setShowDescription] = useState(false);
  const [bookmarkSaving, setBookmarkSaving] = useState(false);

  const { isAuthenticated, accessToken, login } = useAuth();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const { video, loading: videoLoading, error: videoError } = useVideoDetails(id || '');
  const { videos: relatedVideos, loading: relatedLoading } = useRelatedVideos(id || '');
  const youtubeVideoId = video?.sourceType === 'youtube' ? video.sourceRef : null;
  const portalVideoId = video?.id;
  const effectiveVideoId = portalVideoId ?? id ?? '';
  const bookmarked = effectiveVideoId ? isBookmarked(effectiveVideoId) : false;
  const { t } = useI18n();

  useEffect(() => {
    if (!effectiveVideoId || !accessToken) return;

    videoPortalApi
      .recordHistory(accessToken, effectiveVideoId, {
        positionSeconds: 0,
        context: { source: 'watch_page' },
      })
      .catch(error => {
        console.error('Failed to record history', error);
      });
  }, [effectiveVideoId, accessToken]);


  const handleBookmark = async () => {
    if (!video || !effectiveVideoId) {
      console.warn('Missing video id for bookmarking');
      return;
    }
    if (!isAuthenticated) {
      login(`/watch/${video.id}`);
      return;
    }

    try {
      setBookmarkSaving(true);
      await toggleBookmark(effectiveVideoId);
    } catch (error) {
      console.error('Bookmark failed', error);
    } finally {
      setBookmarkSaving(false);
    }
  };

  if (videoLoading) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="bg-gray-300 dark:bg-gray-700 aspect-video rounded-xl mb-4"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (videoError || !video) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('viewer.videoNotFoundTitle')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {videoError || t('viewer.videoNotFoundSubtitle')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Video Content */}
        <div className="flex-1">
          {/* Video Player */}
          <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
            {youtubeVideoId ? (
              <YouTubePlayer videoId={youtubeVideoId} autoplay className="w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-lg font-medium">
                {t('viewer.playbackSoon')}
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="mt-4">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {video.title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {(video.channelName || 'S').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {video.channelName || t('viewer.channelFallback')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('viewer.subscribers')}
                  </p>
                </div>
                <button className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors font-medium flex items-center gap-2">
                  <Bell size={16} />
                  {t('viewer.subscribe')}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full">
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-l-full transition-colors">
                    <ThumbsUp size={16} />
                    <span className="text-sm font-medium">{video.likeCount || '0'}</span>
                  </button>
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-r-full transition-colors">
                    <ThumbsDown size={16} />
                  </button>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <Share2 size={16} />
                  <span className="text-sm font-medium">{t('viewer.share')}</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <Download size={16} />
                  <span className="text-sm font-medium">{t('viewer.download')}</span>
                </button>
                <button
                  onClick={handleBookmark}
                  disabled={bookmarkSaving}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                    bookmarked
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  <span className="text-sm font-medium">
                    {bookmarkSaving
                      ? t('viewer.saving')
                      : bookmarked
                        ? t('viewer.saved')
                        : t('viewer.save')}
                  </span>
                </button>
                <button className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>

            {/* Video Stats and Description */}
            <div className="mt-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-4 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                 {video.views && <span>{video.views} {t('viewer.viewsLabel')}</span>}
                 <span>•</span>
                 <span>{video.uploadDate || t('viewer.justNow')}</span>
                 <div className="flex gap-2 ml-auto">
                    {(video.tags || []).slice(0, 3).map(tag => (
                       <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                 </div>
               </div>
              <p className={`text-gray-700 dark:text-gray-300 ${!showDescription ? 'line-clamp-2' : ''}`}>
                {video.description}
              </p>
              <button
                onClick={() => setShowDescription(!showDescription)}
                className="text-red-500 hover:text-red-600 text-sm font-medium mt-2"
              >
                {showDescription ? t('viewer.description.showLess') : t('viewer.description.showMore')}
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <CommentsSection videoId={video.id} />
        </div>

        {/* Related Videos Sidebar */}
        <div className="lg:w-96">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('viewer.related')}
          </h3>
          {relatedLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="w-40 h-24 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {relatedVideos.slice(0, 10).map(relatedVideo => (
                <VideoCard
                  key={relatedVideo.id}
                  video={relatedVideo}
                  isHorizontal
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerPage;
