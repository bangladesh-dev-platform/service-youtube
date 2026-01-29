import { useState, useEffect, useCallback, useRef } from 'react';
import { Video } from '../types';
import { videoPortalApi } from '../services/videoPortalApi';
import { convertPortalVideoToVideo } from '../utils/videoUtils';

const DEFAULT_PAGE_SIZE = 24;

interface PaginatedResult {
  videos: Video[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
}

const usePaginatedFetcher = (
  fetcher: (args: { page: number; limit: number }) => Promise<Video[]>,
  options: { enabled?: boolean; dependencies?: unknown[]; pageSize?: number } = {}
): PaginatedResult => {
  const { enabled = true, dependencies = [], pageSize = DEFAULT_PAGE_SIZE } = options;
  const fetcherRef = useRef(fetcher);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const fetchPage = useCallback(
    async (nextPage: number, append: boolean) => {
      if (!enabled) {
        setVideos([]);
        setHasMore(false);
        return;
      }

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const items = await fetcherRef.current({ page: nextPage, limit: pageSize });
        setVideos(prev => (append ? [...prev, ...items] : items));
        setHasMore(items.length === pageSize);
        setPage(nextPage);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load videos';
        setError(message);
        if (!append) {
          setVideos([]);
        }
        setHasMore(false);
      } finally {
        if (append) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [enabled, pageSize]
  );

  useEffect(() => {
    if (enabled) {
      fetchPage(1, false);
    } else {
      setVideos([]);
      setHasMore(false);
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, fetchPage, pageSize, ...dependencies]);

  const loadMore = useCallback(() => {
    if (!enabled || loading || loadingMore || !hasMore) return;
    fetchPage(page + 1, true);
  }, [enabled, fetchPage, page, loading, loadingMore, hasMore]);

  return { videos, loading, loadingMore, error, hasMore, loadMore };
};

export const useVideoSearch = (query: string, enabled: boolean = true, pageSize: number = DEFAULT_PAGE_SIZE): PaginatedResult => {
  const trimmed = query.trim();
  return usePaginatedFetcher(
    async ({ page, limit }) => {
      if (!trimmed) return [];
      const result = await videoPortalApi.search({ query: trimmed, page, limit });
      return result.items.map(convertPortalVideoToVideo);
    },
    {
      enabled: enabled && !!trimmed,
      dependencies: [trimmed],
      pageSize,
    }
  );
};

export const useTrendingVideos = (pageSize: number = DEFAULT_PAGE_SIZE): PaginatedResult =>
  usePaginatedFetcher(
    async ({ page, limit }) => {
      const result = await videoPortalApi.getFeed({ page, limit });
      return result.items.map(convertPortalVideoToVideo);
    },
    { pageSize }
  );

export const useVideoDetails = (videoId: string) => {
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      if (!videoId) return;

      try {
        setLoading(true);
        const data = await videoPortalApi.getVideo(videoId);
        setVideo(convertPortalVideoToVideo(data));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch video details');
        setVideo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoDetails();
  }, [videoId]);

  return { video, loading, error };
};

export const useRelatedVideos = (videoId: string) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedVideos = async () => {
      if (!videoId) return;

      try {
        setLoading(true);
        const result = await videoPortalApi.getFeed({ limit: 12 });
        const mapped = result.items
          .filter(item => item.id !== videoId)
          .map(convertPortalVideoToVideo);
        setVideos(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch related videos');
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedVideos();
  }, [videoId]);

  return { videos, loading, error };
};

export const useVideosByCategory = (
  categoryId: string,
  enabled: boolean = true,
  pageSize: number = DEFAULT_PAGE_SIZE
): PaginatedResult =>
  usePaginatedFetcher(
    async ({ page, limit }) => {
      const params = categoryId ? { category: categoryId, page, limit } : { page, limit };
      const result = await videoPortalApi.getFeed(params);
      return result.items.map(convertPortalVideoToVideo);
    },
    {
      enabled,
      dependencies: [categoryId],
      pageSize,
    }
  );
