import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal, Bell } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import YouTubePlayer from '../components/YouTubePlayer';
import { useVideoDetails, useRelatedVideos } from '../hooks/useYouTubeData';
import { youtubeApi } from '../services/youtubeApi';
import { Comment } from '../types';

const VideoPlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [showDescription, setShowDescription] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const { video, loading: videoLoading, error: videoError } = useVideoDetails(id || '');
  const { videos: relatedVideos, loading: relatedLoading } = useRelatedVideos(id || '');

  useEffect(() => {
    const fetchComments = async () => {
      if (!id) return;
      
      setLoadingComments(true);
      try {
        const commentsData = await youtubeApi.getVideoComments(id);
        const formattedComments: Comment[] = commentsData.map(item => ({
          id: item.id,
          authorDisplayName: item.snippet.topLevelComment.snippet.authorDisplayName,
          authorProfileImageUrl: item.snippet.topLevelComment.snippet.authorProfileImageUrl,
          textDisplay: item.snippet.topLevelComment.snippet.textDisplay,
          publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
          likeCount: item.snippet.topLevelComment.snippet.likeCount,
          replies: item.replies?.comments?.map((reply: any) => ({
            id: reply.id,
            authorDisplayName: reply.snippet.authorDisplayName,
            authorProfileImageUrl: reply.snippet.authorProfileImageUrl,
            textDisplay: reply.snippet.textDisplay,
            publishedAt: reply.snippet.publishedAt,
            likeCount: reply.snippet.likeCount
          })) || []
        }));
        setComments(formattedComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setComments([]);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [id]);

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
            Video not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {videoError || "The video you're looking for doesn't exist or couldn't be loaded."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Video Content */}
        <div className="flex-1">
          {/* Video Player */}
          <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
            <YouTubePlayer
              videoId={id || ''}
              autoplay={true}
              className="w-full h-full"
            />
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
                    {video.channelName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {video.channelName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Subscribers
                  </p>
                </div>
                <button className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors font-medium flex items-center gap-2">
                  <Bell size={16} />
                  Subscribe
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
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <Share2 size={16} />
                  <span className="text-sm font-medium">Share</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <Download size={16} />
                  <span className="text-sm font-medium">Download</span>
                </button>
                <button className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>

            {/* Video Stats and Description */}
            <div className="mt-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-4 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {video.views !== 'N/A' && <span>{video.views} views</span>}
                <span>•</span>
                <span>{video.uploadDate}</span>
                <div className="flex gap-2 ml-auto">
                  {video.tags.slice(0, 3).map(tag => (
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
                {showDescription ? 'Show less' : 'Show more'}
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Comments {video.commentCount && `(${video.commentCount})`}
            </h3>
            
            {loadingComments ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-4">
                {comments.slice(0, 10).map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <img
                      src={comment.authorProfileImageUrl}
                      alt={comment.authorDisplayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {comment.authorDisplayName}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {youtubeApi.formatPublishDate(comment.publishedAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {comment.textDisplay}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <button className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                          <ThumbsUp size={14} />
                          <span>{comment.likeCount}</span>
                        </button>
                        <button className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                          <ThumbsDown size={14} />
                        </button>
                        <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                Comments are disabled for this video or couldn't be loaded.
              </p>
            )}
          </div>
        </div>

        {/* Related Videos Sidebar */}
        <div className="lg:w-96">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Related Videos
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