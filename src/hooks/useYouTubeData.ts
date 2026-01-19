import { useState, useEffect } from 'react';
import { youtubeApi, YouTubeVideo, YouTubeVideoDetails } from '../services/youtubeApi';
import { Video } from '../types';
import { convertYouTubeVideoToVideo } from '../utils/videoUtils';

export const useYouTubeSearch = (query: string, enabled: boolean = true) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);

  const searchVideos = async (searchQuery: string, pageToken?: string) => {
    if (!searchQuery.trim()) {
      setVideos([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await youtubeApi.searchVideos(searchQuery, 25, pageToken);
      const convertedVideos = result.videos.map(convertYouTubeVideoToVideo);
      
      if (pageToken) {
        setVideos(prev => [...prev, ...convertedVideos]);
      } else {
        setVideos(convertedVideos);
      }
      
      setNextPageToken(result.nextPageToken);
      setHasMore(!!result.nextPageToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search videos');
      if (!pageToken) setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (nextPageToken && !loading) {
      searchVideos(query, nextPageToken);
    }
  };

  useEffect(() => {
    if (enabled && query) {
      searchVideos(query);
    }
  }, [query, enabled]);

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
        const trendingVideos = await youtubeApi.getTrendingVideos('BD', 50);
        const convertedVideos = trendingVideos.map(convertYouTubeVideoToVideo);
        setVideos(convertedVideos);
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
        const videoDetails = await youtubeApi.getVideoDetails(videoId);
        const convertedVideo = convertYouTubeVideoToVideo(videoDetails);
        setVideo(convertedVideo);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch video details');
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
        const relatedVideos = await youtubeApi.getRelatedVideos(videoId, 20);
        const convertedVideos = relatedVideos.map(convertYouTubeVideoToVideo);
        setVideos(convertedVideos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch related videos');
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
    const fetchVideosByCategory = async () => {
      if (!categoryId) return;

      try {
        setLoading(true);
        const categoryVideos = await youtubeApi.getVideosByCategory(categoryId, 25);
        const convertedVideos = categoryVideos.map(convertYouTubeVideoToVideo);
        setVideos(convertedVideos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch videos by category');
      } finally {
        setLoading(false);
      }
    };

    fetchVideosByCategory();
  }, [categoryId]);

  return { videos, loading, error };
};
