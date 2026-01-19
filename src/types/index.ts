export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  views: string;
  uploadDate: string;
  channelName: string;
  channelAvatar: string;
  channelId: string;
  category: string;
  tags: string[];
  likeCount?: string;
  commentCount?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  watchHistory: string[];
  favorites: string[];
  playlists: Playlist[];
}

export interface Playlist {
  id: string;
  name: string;
  videoIds: string[];
  createdAt: string;
  isPublic: boolean;
}

export interface SearchFilters {
  category: string;
  duration: string;
  uploadDate: string;
  sortBy: string;
}

export interface Comment {
  id: string;
  authorDisplayName: string;
  authorProfileImageUrl: string;
  textDisplay: string;
  publishedAt: string;
  likeCount: number;
  replies?: Comment[];
}

export const VIDEO_CATEGORIES = {
  '1': 'Film & Animation',
  '2': 'Autos & Vehicles',
  '10': 'Music',
  '15': 'Pets & Animals',
  '17': 'Sports',
  '19': 'Travel & Events',
  '20': 'Gaming',
  '22': 'People & Blogs',
  '23': 'Comedy',
  '24': 'Entertainment',
  '25': 'News & Politics',
  '26': 'Howto & Style',
  '27': 'Education',
  '28': 'Science & Technology'
};