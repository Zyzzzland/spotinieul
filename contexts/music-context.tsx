import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Song, Playlist, PlaybackState } from '@/types/music';

interface MusicContextType {
  // Songs
  songs: Song[];
  addSong: (song: Song) => Promise<void>;
  deleteSong: (songId: string) => Promise<void>;
  getSongById: (songId: string) => Song | undefined;

  // Playlists
  playlists: Playlist[];
  createPlaylist: (name: string, description?: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addSongToPlaylist: (playlistId: string, songId: string) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
  getPlaylistById: (playlistId: string) => Playlist | undefined;

  // Playback
  playbackState: PlaybackState;
  playSong: (song: Song, queue?: Song[], startIndex?: number) => Promise<void>;
  playPlaylist: (playlist: Playlist) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  nextSong: () => Promise<void>;
  previousSong: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    currentSong: null,
    isPlaying: false,
    position: 0,
    duration: 0,
    queue: [],
    currentIndex: 0,
    repeatMode: 'off',
    shuffleMode: false,
  });

  const soundRef = useRef<Audio.Sound | null>(null);
  const positionUpdateInterval = useRef<any>(null);

  // Load data from storage
  useEffect(() => {
    loadData();
    setupAudio();
    return () => {
      cleanup();
    };
  }, []);

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error('Error setting up audio:', error);
    }
  };

  const cleanup = async () => {
    if (positionUpdateInterval.current) {
      clearInterval(positionUpdateInterval.current);
    }
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
    }
  };

  const loadData = async () => {
    try {
      const [songsData, playlistsData] = await Promise.all([
        AsyncStorage.getItem('songs'),
        AsyncStorage.getItem('playlists'),
      ]);
      if (songsData) setSongs(JSON.parse(songsData));
      if (playlistsData) setPlaylists(JSON.parse(playlistsData));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveSongs = async (newSongs: Song[]) => {
    try {
      await AsyncStorage.setItem('songs', JSON.stringify(newSongs));
      setSongs(newSongs);
    } catch (error) {
      console.error('Error saving songs:', error);
    }
  };

  const savePlaylists = async (newPlaylists: Playlist[]) => {
    try {
      await AsyncStorage.setItem('playlists', JSON.stringify(newPlaylists));
      setPlaylists(newPlaylists);
    } catch (error) {
      console.error('Error saving playlists:', error);
    }
  };

  // Song management
  const addSong = async (song: Song) => {
    await saveSongs([...songs, song]);
  };

  const deleteSong = async (songId: string) => {
    await saveSongs(songs.filter((s) => s.id !== songId));
    // Remove from playlists
    const updatedPlaylists = playlists.map((p) => ({
      ...p,
      songs: p.songs.filter((id) => id !== songId),
    }));
    await savePlaylists(updatedPlaylists);
  };

  const getSongById = (songId: string) => {
    return songs.find((s) => s.id === songId);
  };

  // Playlist management
  const createPlaylist = async (name: string, description?: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      description,
      songs: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await savePlaylists([...playlists, newPlaylist]);
  };

  const deletePlaylist = async (playlistId: string) => {
    await savePlaylists(playlists.filter((p) => p.id !== playlistId));
  };

  const addSongToPlaylist = async (playlistId: string, songId: string) => {
    const updatedPlaylists = playlists.map((p) => {
      if (p.id === playlistId && !p.songs.includes(songId)) {
        return {
          ...p,
          songs: [...p.songs, songId],
          updatedAt: Date.now(),
        };
      }
      return p;
    });
    await savePlaylists(updatedPlaylists);
  };

  const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
    const updatedPlaylists = playlists.map((p) => {
      if (p.id === playlistId) {
        return {
          ...p,
          songs: p.songs.filter((id) => id !== songId),
          updatedAt: Date.now(),
        };
      }
      return p;
    });
    await savePlaylists(updatedPlaylists);
  };

  const getPlaylistById = (playlistId: string) => {
    return playlists.find((p) => p.id === playlistId);
  };

  // Playback controls
  const startPositionUpdates = () => {
    if (positionUpdateInterval.current) {
      clearInterval(positionUpdateInterval.current);
    }
    positionUpdateInterval.current = setInterval(async () => {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          setPlaybackState((prev) => ({
            ...prev,
            position: status.positionMillis / 1000,
            duration: (status.durationMillis || 0) / 1000,
          }));

          // Auto-advance to next song
          if (status.didJustFinish) {
            nextSong();
          }
        }
      }
    }, 500);
  };

  const playSong = async (song: Song, queue?: Song[], startIndex?: number) => {
    try {
      // Stop current playback
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Play song using expo-av
      const { sound } = await Audio.Sound.createAsync(
        { uri: song.uri },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      
      setPlaybackState({
        ...playbackState,
        currentSong: song,
        isPlaying: true,
        queue: queue || [song],
        currentIndex: startIndex ?? 0,
        position: 0,
      });

      startPositionUpdates();
    } catch (error) {
      console.error('Error playing song:', error);
    }
  };

  const playPlaylist = async (playlist: Playlist) => {
    const playlistSongs = playlist.songs
      .map((id) => getSongById(id))
      .filter((s): s is Song => s !== undefined);

    if (playlistSongs.length > 0) {
      await playSong(playlistSongs[0], playlistSongs, 0);
    }
  };

  const togglePlayPause = async () => {
    try {
      if (!soundRef.current) return;
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        if (playbackState.isPlaying) {
          await soundRef.current.pauseAsync();
          if (positionUpdateInterval.current) {
            clearInterval(positionUpdateInterval.current);
          }
        } else {
          await soundRef.current.playAsync();
          startPositionUpdates();
        }
        setPlaybackState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const nextSong = async () => {
    const { queue, currentIndex, repeatMode } = playbackState;

    if (queue.length === 0) return;

    let nextIndex: number;

    if (repeatMode === 'one') {
      nextIndex = currentIndex;
    } else {
      // Circular loop: go to next song, or wrap to beginning
      nextIndex = (currentIndex + 1) % queue.length;
    }

    await playSong(queue[nextIndex], queue, nextIndex);
  };

  const previousSong = async () => {
    const { queue, currentIndex, position } = playbackState;

    if (queue.length === 0) return;

    // If more than 3 seconds into the song, restart it
    if (position > 3) {
      await seekTo(0);
      return;
    }

    // Go to previous song
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1;
    await playSong(queue[prevIndex], queue, prevIndex);
  };

  const seekTo = async (position: number) => {
    try {
      if (!soundRef.current) return;
      await soundRef.current.setPositionAsync(position * 1000);
      setPlaybackState((prev) => ({ ...prev, position }));
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const toggleRepeat = () => {
    const modes: Array<'off' | 'one' | 'all'> = ['off', 'one', 'all'];
    const currentModeIndex = modes.indexOf(playbackState.repeatMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    setPlaybackState((prev) => ({ ...prev, repeatMode: nextMode }));
  };

  const toggleShuffle = () => {
    setPlaybackState((prev) => ({ ...prev, shuffleMode: !prev.shuffleMode }));
    // TODO: Implement shuffle logic for queue reordering
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (!status.isLoaded) return;
    
    if (status.didJustFinish && !status.isLooping) {
      nextSong();
    }
  };

  return (
    <MusicContext.Provider
      value={{
        songs,
        addSong,
        deleteSong,
        getSongById,
        playlists,
        createPlaylist,
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        getPlaylistById,
        playbackState,
        playSong,
        playPlaylist,
        togglePlayPause,
        nextSong,
        previousSong,
        seekTo,
        toggleRepeat,
        toggleShuffle,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}
