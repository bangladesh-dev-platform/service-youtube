import { YouTubeVideo, YouTubeVideoDetails } from '../services/youtubeApi';
import { Video } from '../types';
import { youtubeApi } from '../services/youtubeApi';

export const convertYouTubeVideoToVideo = (ytVideo: YouTubeVideo | YouTubeVideoDetails): Video => {
  const isVideoDetails = 'statistics' in ytVideo;
  const videoId = isVideoDetails ? ytVideo.id : ytVideo.id.videoId;
  
  return {
    id: videoId,
    title: ytVideo.snippet.title,
    description: ytVideo.snippet.description,
    thumbnail: ytVideo.snippet.thumbnails.high?.url || ytVideo.snippet.thumbnails.medium.url,
    duration: isVideoDetails ? youtubeApi.formatDuration(ytVideo.contentDetails.duration) : 'N/A',
    views: isVideoDetails ? youtubeApi.formatViewCount(ytVideo.statistics.viewCount) : 'N/A',
    uploadDate: youtubeApi.formatPublishDate(ytVideo.snippet.publishedAt),
    channelName: ytVideo.snippet.channelTitle,
    channelAvatar: '', // Will be fetched separately if needed
    channelId: ytVideo.snippet.channelId,
    category: 'General',
    tags: isVideoDetails ? ytVideo.snippet.tags || [] : [],
    likeCount: isVideoDetails ? youtubeApi.formatViewCount(ytVideo.statistics.likeCount) : undefined,
    commentCount: isVideoDetails ? youtubeApi.formatViewCount(ytVideo.statistics.commentCount) : undefined
  };
};

export const getYouTubeEmbedUrl = (videoId: string): string => {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
};

export const getYouTubeThumbnail = (videoId: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'high'): string => {
  return `https://img.youtube.com/vi/${videoId}/${quality === 'high' ? 'hqdefault' : quality === 'medium' ? 'mqdefault' : 'default'}.jpg`;
};

export const isValidYouTubeVideoId = (videoId: string): boolean => {
  const regex = /^[a-zA-Z0-9_-]{11}$/;
  return regex.test(videoId);
};

export const extractVideoIdFromUrl = (url: string): string | null => {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};