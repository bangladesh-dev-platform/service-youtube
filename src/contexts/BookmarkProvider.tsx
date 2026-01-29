import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';
import { videoPortalApi } from '../services/videoPortalApi';
import { convertPortalVideoToVideo } from '../utils/videoUtils';
import { BookmarkContext } from './bookmarkContext';
import { Video } from '../types';

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, accessToken } = useAuth();
  const [bookmarks, setBookmarks] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBookmarks = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      setBookmarks([]);
      return;
    }

    setLoading(true);
    try {
      const response = await videoPortalApi.listBookmarks(accessToken, { limit: 100 });
      const mapped = response.items.map(item => convertPortalVideoToVideo(item.video));
      setBookmarks(mapped);
    } catch (error) {
      console.error('Failed to load bookmarks', error);
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, isAuthenticated]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const isBookmarked = useCallback(
    (videoId: string) => bookmarks.some(bookmark => bookmark.id === videoId),
    [bookmarks]
  );

  const addBookmark = useCallback(
    async (videoId: string, notes?: string) => {
      if (!accessToken) {
        throw new Error('Authentication required');
      }
      await videoPortalApi.addBookmark(accessToken, videoId, notes);
      await fetchBookmarks();
    },
    [accessToken, fetchBookmarks]
  );

  const removeBookmark = useCallback(
    async (videoId: string) => {
      if (!accessToken) {
        throw new Error('Authentication required');
      }
      await videoPortalApi.removeBookmark(accessToken, videoId);
      await fetchBookmarks();
    },
    [accessToken, fetchBookmarks]
  );

  const toggleBookmark = useCallback(
    async (videoId: string) => {
      if (isBookmarked(videoId)) {
        await removeBookmark(videoId);
      } else {
        await addBookmark(videoId);
      }
    },
    [addBookmark, isBookmarked, removeBookmark]
  );

  const value = useMemo(
    () => ({ bookmarks, loading, refresh: fetchBookmarks, isBookmarked, addBookmark, removeBookmark, toggleBookmark }),
    [bookmarks, fetchBookmarks, isBookmarked, addBookmark, removeBookmark, toggleBookmark, loading]
  );

  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
};
