export type MediaFormat = 'mp3' | 'mp4' | 'wav' | 'ogg' | 'flac' | 'm4a' | 'webm';

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon?: string;
  trackCount?: number;
  createdAt: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  format: MediaFormat;
  duration: number; // in seconds
  categoryId: string;
  categoryName?: string;
  categoryColor?: string;
  moodTags: string[];
  coverArtUrl?: string;
  isFavorite?: boolean;
  createdAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverArtUrl?: string;
  trackCount?: number;
  tracks?: Track[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  suggestedTrackIds?: string[];
  suggestedTracks?: Track[];
  timestamp: string;
}

export interface AIRecommendationResponse {
  reply: string;
  suggestedTrackIds: string[];
  suggestedTracks?: Track[];
  moodDetected?: string;
}
