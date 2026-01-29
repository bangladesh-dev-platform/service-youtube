import { Video } from '../types';
import { VideoPortalItem } from '../services/videoPortalApi';

const FALLBACK_THUMBNAIL = 'https://images.unsplash.com/photo-1458071101515-8f77c109f8f6?auto=format&fit=crop&w=800&q=60';

export const formatRelativeDate = (dateString?: string | null): string => {
  if (!dateString) return 'Recently added';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Recently added';

  const now = Date.now();
  const diffMs = Math.abs(now - date.getTime());
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

export const convertPortalVideoToVideo = (item: VideoPortalItem): Video => {
  const metadata = item.metadata ?? {};
  const thumbnail = item.thumbnail_url || metadata.thumbnail_url || FALLBACK_THUMBNAIL;
  const duration = metadata.duration ?? (typeof item.duration_seconds === 'number' ? formatSeconds(item.duration_seconds) : undefined);
  const views = metadata.view_count ?? metadata.views ?? undefined;
  const likeCount = metadata.like_count ?? undefined;
  const commentCount = metadata.comment_count ?? undefined;
  const uploadDate = metadata.publish_date ?? item.cached_at ?? item.created_at ?? null;
  const channelName = item.channel_name || metadata.channel_name || 'Banglade.sh Originals';
  const channelId = metadata.channel_id || item.source_ref;
  const tags = Array.isArray(item.tags) ? item.tags : Array.isArray(metadata.tags) ? metadata.tags : [];

  return {
    id: item.id,
    title: item.title,
    description: item.description ?? metadata.description ?? '',
    thumbnail,
    duration,
    views,
    uploadDate: formatRelativeDate(uploadDate),
    channelName,
    channelAvatar: metadata.channel_avatar ?? '',
    channelId,
    category: metadata.category ?? 'General',
    tags,
    likeCount,
    commentCount,
    sourceType: item.source_type,
    sourceRef: item.source_ref,
    metadata,
    cachedAt: item.cached_at ?? null,
  };
};

const formatSeconds = (totalSeconds: number): string | undefined => {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return undefined;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
