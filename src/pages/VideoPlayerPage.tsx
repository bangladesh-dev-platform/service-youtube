import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  MoreHorizontal,
  Bell,
  Bookmark,
  BookmarkCheck,
  Copy,
  Mail,
  Facebook,
  Twitter,
  MessageCircle,
} from 'lucide-react';
import VideoCard from '../components/VideoCard';
import YouTubePlayer from '../components/YouTubePlayer';
import { useVideoDetails, useRelatedVideos } from '../hooks/useYouTubeData';
import { useAuth } from '../contexts/useAuth';
import { useBookmarks } from '../contexts/useBookmarks';
import { videoPortalApi } from '../services/videoPortalApi';
import type { DownloadFormat } from '../services/videoPortalApi';
import CommentsSection from '../components/CommentsSection';
import { useI18n } from '../i18n';

const formatFileSize = (bytes?: number | null): string => {
  if (bytes === undefined || bytes === null) {
    return '';
  }
  if (bytes === 0) {
    return '0 B';
  }
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const rounded = size >= 10 || size % 1 === 0 ? size.toFixed(0) : size.toFixed(1);
  return `${rounded} ${units[unitIndex]}`;
};

const VideoPlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [showDescription, setShowDescription] = useState(false);
  const [bookmarkSaving, setBookmarkSaving] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [canNativeShare, setCanNativeShare] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadFormats, setDownloadFormats] = useState<DownloadFormat[] | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadReason, setDownloadReason] = useState<string | null>(null);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

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
    if (!effectiveVideoId || typeof window === 'undefined') {
      setShareUrl('');
      return;
    }
    setShareUrl(`${window.location.origin}/watch/${effectiveVideoId}`);
  }, [effectiveVideoId]);

  useEffect(() => {
    if (typeof navigator === 'undefined') {
      setCanNativeShare(false);
      return;
    }
    const nav = navigator as Navigator & { share?: (data?: ShareData) => Promise<void> };
    setCanNativeShare(typeof nav.share === 'function');
  }, []);

  useEffect(() => {
    if (!shareMenuOpen) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShareMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShareMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shareMenuOpen]);

  useEffect(() => {
    if (copyStatus !== 'copied') {
      return;
    }
    const timeoutId = window.setTimeout(() => setCopyStatus('idle'), 2500);
    return () => window.clearTimeout(timeoutId);
  }, [copyStatus]);

  useEffect(() => {
    if (!downloadMenuOpen) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setDownloadMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDownloadMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [downloadMenuOpen]);

  useEffect(() => {
    setDownloadFormats(null);
    setDownloadReason(null);
    setDownloadError(null);
    setDownloadMenuOpen(false);
  }, [effectiveVideoId]);

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

  const fetchDownloadFormats = async () => {
    if (!accessToken || !effectiveVideoId) {
      return;
    }
    setDownloadLoading(true);
    setDownloadError(null);
    try {
      const response = await videoPortalApi.getDownloadFormats(accessToken, effectiveVideoId);
      setDownloadFormats(response.formats);
      setDownloadReason(response.noFormatsReason ?? null);
    } catch (error) {
      console.error('Failed to load download formats', error);
      setDownloadError(error instanceof Error ? error.message : String(error));
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleDownloadClick = () => {
    if (!video || !effectiveVideoId) {
      console.warn('Missing video id for downloads');
      return;
    }
    if (!isAuthenticated) {
      login(`/watch/${video.id}`);
      return;
    }
    setShareMenuOpen(false);
    setDownloadMenuOpen(prev => {
      const next = !prev;
      if (!prev && !downloadFormats && !downloadLoading) {
        void fetchDownloadFormats();
      }
      return next;
    });
  };

  const handleDownloadRetry = () => {
    void fetchDownloadFormats();
  };

  const handleFormatDownload = (format: DownloadFormat) => {
    if (!format.downloadUrl) {
      return;
    }
    window.open(format.downloadUrl, '_blank', 'noopener,noreferrer');
    setDownloadMenuOpen(false);
  };

  const handleCopyLink = async () => {
    if (!shareUrl) {
      return;
    }
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else if (typeof document !== 'undefined') {
        const tempInput = document.createElement('textarea');
        tempInput.value = shareUrl;
        tempInput.style.position = 'fixed';
        tempInput.style.opacity = '0';
        document.body.appendChild(tempInput);
        tempInput.focus();
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      } else {
        throw new Error('Clipboard unavailable');
      }
      setCopyStatus('copied');
    } catch (error) {
      console.error('Failed to copy share link', error);
      setCopyStatus('error');
    }
  };

  const handleNativeShare = async () => {
    if (!shareUrl || typeof navigator === 'undefined') {
      return;
    }
    const nav = navigator as Navigator & { share?: (data?: ShareData) => Promise<void> };
    if (typeof nav.share !== 'function') {
      return;
    }
    try {
      await nav.share({
        title: video.title,
        text: video.description || video.title,
        url: shareUrl,
      });
      setShareMenuOpen(false);
    } catch (error) {
      if ((error as DOMException)?.name === 'AbortError') {
        return;
      }
      console.error('Native share failed', error);
    }
  };


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

  const shareTitle = video.title || t('app.name');
  const encodedShareUrl = shareUrl ? encodeURIComponent(shareUrl) : '';
  const encodedShareTitle = encodeURIComponent(shareTitle);
  const emailShareHref = shareUrl
    ? `mailto:?subject=${encodedShareTitle}&body=${encodeURIComponent(`${shareTitle}\n\n${shareUrl}`)}`
    : '#';
  const facebookShareHref = shareUrl
    ? `https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}`
    : '#';
  const twitterShareHref = shareUrl
    ? `https://twitter.com/intent/tweet?url=${encodedShareUrl}&text=${encodedShareTitle}`
    : '#';
  const whatsappShareHref = shareUrl
    ? `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`
    : '#';

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
                <div className="relative" ref={shareMenuRef}>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => {
                      setDownloadMenuOpen(false);
                      setShareMenuOpen(prev => !prev);
                    }}
                    aria-haspopup="menu"
                    aria-expanded={shareMenuOpen}
                  >
                    <Share2 size={16} />
                    <span className="text-sm font-medium">{t('viewer.share')}</span>
                  </button>
                  {shareMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl z-30 p-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                        {t('viewer.share.menuTitle')}
                      </p>
                      <div className="flex flex-col gap-2" role="menu">
                        {canNativeShare && (
                          <button
                            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium text-gray-900 dark:text-white transition-colors"
                            onClick={handleNativeShare}
                          >
                            <Share2 size={16} />
                            <span>{t('viewer.share.native')}</span>
                          </button>
                        )}
                        <button
                          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium text-gray-900 dark:text-white transition-colors"
                          onClick={handleCopyLink}
                        >
                          <Copy size={16} />
                          <span>
                            {copyStatus === 'copied' ? t('viewer.share.copied') : t('viewer.share.copyLink')}
                          </span>
                        </button>
                        <a
                          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium text-gray-900 dark:text-white transition-colors"
                          href={emailShareHref}
                          onClick={() => setShareMenuOpen(false)}
                        >
                          <Mail size={16} />
                          <span>{t('viewer.share.email')}</span>
                        </a>
                        <a
                          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium text-gray-900 dark:text-white transition-colors"
                          href={facebookShareHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setShareMenuOpen(false)}
                        >
                          <Facebook size={16} />
                          <span>{t('viewer.share.facebook')}</span>
                        </a>
                        <a
                          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium text-gray-900 dark:text-white transition-colors"
                          href={twitterShareHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setShareMenuOpen(false)}
                        >
                          <Twitter size={16} />
                          <span>{t('viewer.share.twitter')}</span>
                        </a>
                        <a
                          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium text-gray-900 dark:text-white transition-colors"
                          href={whatsappShareHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setShareMenuOpen(false)}
                        >
                          <MessageCircle size={16} />
                          <span>{t('viewer.share.whatsapp')}</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative" ref={downloadMenuRef}>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onClick={handleDownloadClick}
                    aria-haspopup="menu"
                    aria-expanded={downloadMenuOpen}
                    title={!isAuthenticated ? t('viewer.download.loginPrompt') : undefined}
                  >
                    <Download size={16} />
                    <span className="text-sm font-medium">{t('viewer.download')}</span>
                  </button>
                  {downloadMenuOpen && (
                    <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl z-30 p-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                        {t('viewer.download.menuTitle')}
                      </p>
                      {downloadLoading && (
                        <div className="space-y-2">
                          {Array.from({ length: 2 }).map((_, index) => (
                            <div key={index} className="h-11 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                          ))}
                          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            {t('viewer.download.loading')}
                          </p>
                        </div>
                      )}
                      {!downloadLoading && downloadError && (
                        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 text-sm text-red-600 dark:text-red-200 p-3 flex flex-col gap-2">
                          <span>{t('viewer.download.error')}</span>
                          <button
                            className="self-start text-xs font-semibold text-red-600 dark:text-red-200 hover:underline"
                            onClick={handleDownloadRetry}
                          >
                            {t('viewer.download.retry')}
                          </button>
                        </div>
                      )}
                      {!downloadLoading && !downloadError && downloadFormats && downloadFormats.length === 0 && (
                        <div className="rounded-xl bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 p-3">
                          {downloadReason || t('viewer.download.unavailable')}
                        </div>
                      )}
                      {!downloadLoading && !downloadError && downloadFormats && downloadFormats.length > 0 && (
                        <div className="flex flex-col gap-2">
                          {downloadFormats.map(format => {
                            const primaryLine = [format.label, format.quality, format.container?.toUpperCase()]
                              .filter(Boolean)
                              .join(' · ');
                            const secondaryParts = [
                              format.codec?.toUpperCase() ?? null,
                              format.type === 'audio' ? t('viewer.download.audioOnly') : null,
                              format.sizeBytes ? formatFileSize(format.sizeBytes) : t('viewer.download.sizeUnknown'),
                            ].filter(Boolean);
                            return (
                              <button
                                key={format.id}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                                onClick={() => handleFormatDownload(format)}
                              >
                                <Download size={16} className="text-gray-500" />
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {primaryLine || t('viewer.download')}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {secondaryParts.join(' · ')}
                                  </p>
                                </div>
                                {format.expiresAt && (
                                  <span className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
                                    {new Date(format.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {!downloadLoading && !downloadError && !downloadFormats && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          {t('viewer.download.loading')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
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
