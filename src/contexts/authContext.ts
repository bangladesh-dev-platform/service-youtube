import { createContext } from 'react';
import { User } from '../types';

export interface CompleteLoginPayload {
  accessToken: string;
  refreshToken?: string | null;
}

export interface RawUserPayload {
  id?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar_url?: string;
  watch_history?: User['watchHistory'];
  favorites?: User['favorites'];
  playlists?: User['playlists'];
  roles?: string[];
  permissions?: string[];
  email_verified?: boolean;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (redirectPath?: string) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  completeLogin: (payload: CompleteLoginPayload) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
