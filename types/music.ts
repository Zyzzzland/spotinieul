export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  uri: string; // local file URI
  albumArt?: string;
  addedAt: number; // timestamp
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverArt?: string;
  songs: string[]; // array of song IDs
  createdAt: number;
  updatedAt: number;
}

export interface PlaybackState {
  currentSong: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  queue: Song[];
  currentIndex: number;
  repeatMode: 'off' | 'one' | 'all';
  shuffleMode: boolean;
}
