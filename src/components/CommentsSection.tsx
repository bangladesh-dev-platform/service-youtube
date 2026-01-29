import React, { useState } from 'react';
import { CommentItem } from '../services/videoPortalApi';
import { youtubeApi } from '../services/youtubeApi';
import { useAuth } from '../contexts/useAuth';
import { useVideoComments } from '../hooks/useVideoComments';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useI18n } from '../i18n';

interface CommentsSectionProps {
  videoId: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ videoId }) => {
  const { isAuthenticated, login } = useAuth();
  const { comments, loading, postComment } = useVideoComments({ videoId });
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { t } = useI18n();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    if (!isAuthenticated) {
      login(`/watch/${videoId}`);
      return;
    }

    try {
      setSubmitting(true);
      await postComment(trimmed);
      setText('');
    } catch (error) {
      console.error('Failed to post comment', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t('comments.heading')} ({comments.length})
      </h3>

      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={isAuthenticated ? t('comments.placeholder') : t('comments.placeholder.signedOut')}
          className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60 p-4 focus:outline-none focus:ring-2 focus:ring-red-500"
          rows={3}
          disabled={!isAuthenticated || submitting}
        />
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={!text.trim() || submitting}
            className="px-5 py-2 bg-red-500 text-white rounded-xl font-medium disabled:opacity-60"
          >
            {submitting ? t('comments.posting') : t('comments.post')}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-gray-600 dark:text-gray-400">{t('comments.loading')}</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">{t('comments.empty')}</p>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentRow key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentRow: React.FC<{ comment: CommentItem }> = ({ comment }) => {
  const { t } = useI18n();
  const author = comment.author;
  const fallbackName = t('comments.userFallback');
  const displayName = author
    ? [author['first_name'], author['last_name']].filter(Boolean).join(' ') || author['email']
    : fallbackName;

  return (
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white font-semibold">
        {displayName.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 dark:text-white">{displayName}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {youtubeApi.formatPublishDate(comment.created_at)}
          </span>
        </div>
        <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">
          {comment.is_deleted ? t('comments.deleted') : comment.body}
        </p>
        <div className="flex items-center gap-4 mt-2 text-gray-500 dark:text-gray-400 text-sm">
          <button className="flex items-center gap-1">
            <ThumbsUp size={14} />
            <span>{comment.like_count}</span>
          </button>
          <button className="flex items-center gap-1">
            <ThumbsDown size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentsSection;
