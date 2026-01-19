import axios from 'axios';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
      standard?: { url: string; width: number; height: number };
      maxres?: { url: string; width: number; height: number };
    };
    channelTitle: string;
    liveBroadcastContent: string;
    publishTime: string;
  };
}

export interface YouTubeVideoDetails {
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
      standard?: { url: string; width: number; height: number };
      maxres?: { url: string; width: number; height: number };
    };
    channelTitle: string;
    tags?: string[];
    categoryId: string;
    liveBroadcastContent: string;
    defaultLanguage?: string;
    defaultAudioLanguage?: string;
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    favoriteCount: string;
    commentCount: string;
  };
  contentDetails: {
    duration: string;
    dimension: string;
    definition: string;
    caption: string;
    licensedContent: boolean;
    contentRating: {};
    projection: string;
  };
}

export interface YouTubeChannel {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
  };
  statistics: {
    viewCount: string;
    subscriberCount: string;
    hiddenSubscriberCount: boolean;
    videoCount: string;
  };
}

class YouTubeApiService {
  private apiKey: string;

  constructor() {
    this.apiKey = API_KEY || '';
    if (!this.apiKey) {
      console.warn('YouTube API key not found. Please set VITE_YOUTUBE_API_KEY in your environment variables.');
    }
  }

  // Search for videos
  async searchVideos(query: string, maxResults: number = 25, pageToken?: string): Promise<{
    videos: YouTubeVideo[];
    nextPageToken?: string;
    totalResults: number;
  }> {
    try {
      const response = await axios.get(`${BASE_URL}/search`, {
        params: {
          part: 'snippet',
          q: query,
          type: 'video',
          maxResults,
          pageToken,
          key: this.apiKey,
          order: 'relevance',
          safeSearch: 'moderate',
          videoEmbeddable: 'true',
          regionCode: 'BD'
        }
      });

      return {
        videos: response.data.items,
        nextPageToken: response.data.nextPageToken,
        totalResults: response.data.pageInfo.totalResults
      };
    } catch (error) {
      console.error('Error searching videos:', error);
      throw new Error('Failed to search videos');
    }
  }

  // Get trending videos
  async getTrendingVideos(regionCode: string = 'BD', maxResults: number = 25): Promise<YouTubeVideoDetails[]> {
    try {
      const response = await axios.get(`${BASE_URL}/videos`, {
        params: {
          part: 'snippet,statistics,contentDetails',
          chart: 'mostPopular',
          regionCode,
          maxResults,
          key: this.apiKey,
          videoCategoryId: '0'
        }
      });

      return response.data.items;
    } catch (error) {
      console.error('Error fetching trending videos:', error);
      throw new Error('Failed to fetch trending videos');
    }
  }

  // Get video details by ID
  async getVideoDetails(videoId: string): Promise<YouTubeVideoDetails> {
    try {
      const response = await axios.get(`${BASE_URL}/videos`, {
        params: {
          part: 'snippet,statistics,contentDetails',
          id: videoId,
          key: this.apiKey
        }
      });

      if (response.data.items.length === 0) {
        throw new Error('Video not found');
      }

      return response.data.items[0];
    } catch (error) {
      console.error('Error fetching video details:', error);
      throw new Error('Failed to fetch video details');
    }
  }

  // Get channel details
  async getChannelDetails(channelId: string): Promise<YouTubeChannel> {
    try {
      const response = await axios.get(`${BASE_URL}/channels`, {
        params: {
          part: 'snippet,statistics',
          id: channelId,
          key: this.apiKey
        }
      });

      if (response.data.items.length === 0) {
        throw new Error('Channel not found');
      }

      return response.data.items[0];
    } catch (error) {
      console.error('Error fetching channel details:', error);
      throw new Error('Failed to fetch channel details');
    }
  }

  // Get videos by category
  async getVideosByCategory(categoryId: string, maxResults: number = 25, regionCode: string = 'BD'): Promise<YouTubeVideoDetails[]> {
    try {
      const response = await axios.get(`${BASE_URL}/videos`, {
        params: {
          part: 'snippet,statistics,contentDetails',
          chart: 'mostPopular',
          videoCategoryId: categoryId,
          regionCode,
          maxResults,
          key: this.apiKey
        }
      });

      return response.data.items;
    } catch (error) {
      console.error('Error fetching videos by category:', error);
      throw new Error('Failed to fetch videos by category');
    }
  }

  // Get related videos (using search with similar terms)
  async getRelatedVideos(videoId: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
    try {
      // First get the video details to extract keywords
      const videoDetails = await this.getVideoDetails(videoId);
      const searchQuery = videoDetails.snippet.title.split(' ').slice(0, 3).join(' ');
      
      const response = await axios.get(`${BASE_URL}/search`, {
        params: {
          part: 'snippet',
          q: searchQuery,
          type: 'video',
          maxResults,
          key: this.apiKey,
          order: 'relevance',
          safeSearch: 'moderate',
          videoEmbeddable: 'true',
          regionCode: 'BD'
        }
      });

      // Filter out the current video
      return response.data.items.filter((video: YouTubeVideo) => video.id.videoId !== videoId);
    } catch (error) {
      console.error('Error fetching related videos:', error);
      throw new Error('Failed to fetch related videos');
    }
  }

  // Get video comments
  async getVideoComments(videoId: string, maxResults: number = 20): Promise<any[]> {
    try {
      const response = await axios.get(`${BASE_URL}/commentThreads`, {
        params: {
          part: 'snippet,replies',
          videoId,
          maxResults,
          order: 'relevance',
          key: this.apiKey
        }
      });

      return response.data.items;
    } catch (error) {
      console.error('Error fetching comments:', error);
      return []; // Return empty array if comments are disabled
    }
  }

  // Format duration from ISO 8601 to readable format
  formatDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00';

    const hours = parseInt(match[1]?.replace('H', '') || '0');
    const minutes = parseInt(match[2]?.replace('M', '') || '0');
    const seconds = parseInt(match[3]?.replace('S', '') || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Format view count
  formatViewCount(viewCount: string): string {
    const count = parseInt(viewCount);
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }

  // Format publish date
  formatPublishDate(publishedAt: string): string {
    const now = new Date();
    const published = new Date(publishedAt);
    const diffTime = Math.abs(now.getTime() - published.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }
}

export const youtubeApi = new YouTubeApiService();