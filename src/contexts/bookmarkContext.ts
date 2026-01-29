import { createContext } from 'react';
import { Video } from '../types';

export interface BookmarkContextValue {
  bookmarks: Video[];
  loading: boolean;
  refresh: () => Promise<void>;
  isBookmarked: (videoId: string) => boolean;
  addBookmark: (videoId: string, notes?: string) => Promise<void>;
  removeBookmark: (videoId: string) => Promise<void>;
  toggleBookmark: (videoId: string) => Promise<void>;
}

export const BookmarkContext = createContext<BookmarkContextValue | undefined>(undefined);
