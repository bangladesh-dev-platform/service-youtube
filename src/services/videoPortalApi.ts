import { API_BASE_URL } from '../config/env';

export interface VideoPortalItem {
  id: string;
  source_type: string;
  source_ref: string;
  title: string;
  description?: string | null;
  channel_name?: string | null;
  duration_seconds?: number | null;
  thumbnail_url?: string | null;
  status?: string;
  visibility?: string;
  tags?: string[];
  metadata?: Record<string, unknown> | null;
  cached_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface PaginatedPayload<T> {
  items: T[];
  page: number;
  limit: number;
  category?: string | null;
  query?: string | null;
}

interface BookmarkEntity {
  id: string;
  user_id: string;
  video_id: string;
  notes?: string | null;
  created_at: string;
}

export interface BookmarkRecord {
  bookmark: BookmarkEntity;
  video: VideoPortalItem;
}

interface HistoryEntity {
  id: string;
  user_id: string;
  video_id: string;
  last_watched_at: string;
  last_position_seconds: number;
  watch_count: number;
  context: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface HistoryRecord {
  history: HistoryEntity;
  video: VideoPortalItem;
}

export interface DownloadFormat {
  id: string;
  label?: string | null;
  quality?: string | null;
  container?: string | null;
  codec?: string | null;
  sizeBytes?: number | null;
  type?: 'video' | 'audio' | string | null;
  downloadUrl: string;
  expiresAt?: string | null;
}

export interface DownloadFormatsPayload {
  videoId: string;
  sourceType?: string | null;
  formats: DownloadFormat[];
  noFormatsReason?: string | null;
}

export interface CommentItem {
  id: string;
  video_id: string;
  user_id: string;
  parent_id?: string | null;
  body: string;
  like_count: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    email: string;
    first_name?: string | null;
    last_name?: string | null;
    avatar_url?: string | null;
  } | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

const buildQuery = (params: Record<string, string | number | undefined | null>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const headers = new Headers(init?.headers ?? {});
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || payload.success === false) {
    const message = payload.error?.message || 'Request failed';
    throw new Error(message);
  }

  return payload.data;
};

const authedRequest = async <T>(path: string, token: string, init?: RequestInit): Promise<T> => {
  if (!token) {
    throw new Error('Authentication required');
  }

  return request<T>(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
};

export const videoPortalApi = {
  async getFeed(params: { page?: number; limit?: number; category?: string | null } = {}): Promise<PaginatedPayload<VideoPortalItem>> {
    const query = buildQuery({
      page: params.page ?? 1,
      limit: params.limit ?? 12,
      category: params.category ?? undefined,
    });

    return request<PaginatedPayload<VideoPortalItem>>(`/api/v1/video/feed${query}`);
  },

  async search(params: { query?: string; page?: number; limit?: number } = {}): Promise<PaginatedPayload<VideoPortalItem>> {
    const query = buildQuery({
      q: params.query ?? '',
      page: params.page ?? 1,
      limit: params.limit ?? 12,
    });

    return request<PaginatedPayload<VideoPortalItem>>(`/api/v1/video/search${query}`);
  },

  async getVideo(id: string): Promise<VideoPortalItem> {
    return request<VideoPortalItem>(`/api/v1/video/${id}`);
  },

  async listBookmarks(token: string, params: { page?: number; limit?: number } = {}): Promise<PaginatedPayload<BookmarkRecord>> {
    const query = buildQuery({
      page: params.page ?? 1,
      limit: params.limit ?? 24,
    });

    return authedRequest<PaginatedPayload<BookmarkRecord>>(`/api/v1/video/bookmarks${query}`, token);
  },

  async addBookmark(token: string, videoId: string, notes?: string): Promise<BookmarkRecord> {
    return authedRequest<BookmarkRecord>(`/api/v1/video/bookmarks`, token, {
      method: 'POST',
      body: JSON.stringify({
        video_id: videoId,
        notes,
      }),
    });
  },

  async removeBookmark(token: string, videoId: string): Promise<void> {
    await authedRequest(`/api/v1/video/bookmarks/${videoId}`, token, {
      method: 'DELETE',
    });
  },

  async listHistory(token: string, params: { page?: number; limit?: number } = {}): Promise<PaginatedPayload<HistoryRecord>> {
    const query = buildQuery({
      page: params.page ?? 1,
      limit: params.limit ?? 24,
    });

    return authedRequest<PaginatedPayload<HistoryRecord>>(`/api/v1/video/history${query}`, token);
  },

  async recordHistory(
    token: string,
    videoId: string,
    options: { positionSeconds?: number; context?: Record<string, unknown> } = {}
  ): Promise<HistoryRecord> {
    return authedRequest<HistoryRecord>(`/api/v1/video/history`, token, {
      method: 'POST',
      body: JSON.stringify({
        video_id: videoId,
        position_seconds: options.positionSeconds ?? null,
        context: options.context ?? {},
      }),
    });
  },

  async listComments(videoId: string, params: { parentId?: string; page?: number; limit?: number } = {}): Promise<PaginatedPayload<CommentItem>> {
    const query = buildQuery({
      parent_id: params.parentId,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    });

    return request<PaginatedPayload<CommentItem>>(`/api/v1/video/${videoId}/comments${query}`);
  },

  async postComment(token: string, videoId: string, text: string, parentId?: string): Promise<CommentItem> {
    return authedRequest<CommentItem>(`/api/v1/video/${videoId}/comments`, token, {
      method: 'POST',
      body: JSON.stringify({
        body: text,
        parent_id: parentId,
      }),
    });
  },

  async deleteComment(token: string, commentId: string): Promise<void> {
    await authedRequest(`/api/v1/video/comments/${commentId}`, token, {
      method: 'DELETE',
    });
  },

  async getDownloadFormats(token: string, videoId: string): Promise<DownloadFormatsPayload> {
    interface DownloadFormatsApiResponse {
      video_id: string;
      source_type?: string | null;
      formats: Array<{
        id: string;
        label?: string | null;
        quality?: string | null;
        container?: string | null;
        codec?: string | null;
        size_bytes?: number | null;
        type?: 'video' | 'audio' | string | null;
        download_url: string;
        expires_at?: string | null;
      }>;
      no_formats_reason?: string | null;
    }

    const data = await authedRequest<DownloadFormatsApiResponse>(`/api/v1/video/${videoId}/downloads`, token);

    return {
      videoId: data.video_id,
      sourceType: data.source_type ?? null,
      noFormatsReason: data.no_formats_reason ?? null,
      formats: data.formats.map(format => ({
        id: format.id,
        label: format.label ?? null,
        quality: format.quality ?? null,
        container: format.container ?? null,
        codec: format.codec ?? null,
        sizeBytes: format.size_bytes ?? null,
        type: format.type ?? null,
        downloadUrl: format.download_url,
        expiresAt: format.expires_at ?? null,
      })),
    };
  },
};
