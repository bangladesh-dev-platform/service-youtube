import { useState, useEffect, useCallback } from 'react';
import { Video } from '../types';
import { videoPortalApi } from '../services/videoPortalApi';
import { convertPortalVideoToVideo } from '../utils/videoUtils';

export const useVideoSearch = (query: string, enabled: boolean = true) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = useCallback(
    async (nextPage: number, append: boolean) => {
      if (!query.trim()) {
        setVideos([]);
        setHasMore(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await videoPortalApi.search({ query, page: nextPage });
        const mapped = result.items.map(convertPortalVideoToVideo);
        setVideos(prev => (append ? [...prev, ...mapped] : mapped));
        setHasMore(mapped.length > 0 && mapped.length >= (result.limit ?? 0));
        setPage(nextPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search videos');
        if (!append) {
          setVideos([]);
        }
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [query]
  );

  useEffect(() => {
    if (enabled && query) {
      fetchPage(1, false);
    } else {
      setVideos([]);
      setHasMore(false);
    }
  }, [query, enabled, fetchPage]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPage(page + 1, true);
    }
  };

  return { videos, loading, error, loadMore, hasMore };
};

export const useTrendingVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const result = await videoPortalApi.getFeed({ limit: 24 });
        setVideos(result.items.map(convertPortalVideoToVideo));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch trending videos');
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return { videos, loading, error };
};

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

export const useVideosByCategory = (categoryId: string) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchByCategory = async () => {
      try {
        setLoading(true);
        const params = categoryId && categoryId !== 'all' ? { category: categoryId } : {};
        const result = await videoPortalApi.getFeed(params);
        setVideos(result.items.map(convertPortalVideoToVideo));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch videos by category');
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchByCategory();
  }, [categoryId]);

  return { videos, loading, error };
};
