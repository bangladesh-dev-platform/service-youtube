import { useCallback, useEffect, useState } from 'react';
import { CommentItem, videoPortalApi } from '../services/videoPortalApi';
import { useAuth } from '../contexts/useAuth';

interface UseVideoCommentsOptions {
  videoId: string;
  parentId?: string;
}

export const useVideoComments = ({ videoId, parentId }: UseVideoCommentsOptions) => {
  const [items, setItems] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { accessToken } = useAuth();

  const fetchPage = useCallback(
    async (targetPage: number, append: boolean) => {
      if (!videoId) return;

      setLoading(true);
      setError(null);

      try {
        const result = await videoPortalApi.listComments(videoId, {
          parentId,
          page: targetPage,
          limit: 20,
        });

        const newItems = result.items;
        setItems(prev => (append ? [...prev, ...newItems] : newItems));
        setHasMore(newItems.length === result.limit);
        setPage(targetPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load comments');
      } finally {
        setLoading(false);
      }
    },
    [videoId, parentId]
  );

  useEffect(() => {
    setItems([]);
    setPage(1);
    fetchPage(1, false);
  }, [fetchPage]);

  const refresh = useCallback(() => fetchPage(1, false), [fetchPage]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPage(page + 1, true);
    }
  };

  const postComment = async (text: string, replyTo?: string) => {
    if (!accessToken) {
      throw new Error('Authentication required');
    }

    await videoPortalApi.postComment(accessToken, videoId, text, replyTo);
    await refresh();
  };

  const deleteComment = async (commentId: string) => {
    if (!accessToken) {
      throw new Error('Authentication required');
    }

    await videoPortalApi.deleteComment(accessToken, commentId);
    await refresh();
  };

  return {
    comments: items,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    postComment,
    deleteComment,
  };
};
