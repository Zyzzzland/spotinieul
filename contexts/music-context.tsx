import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Song, Playlist, PlaybackState } from '@/types/music';
import { useGoogleCast } from '@/hooks/use-google-cast';

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

  // Google Cast
  isCastConnected: boolean;
  castDeviceName: string | null;
  castCurrentSong: () => Promise<void>;
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
  const usingCastRef = useRef<boolean>(false);
  
  // Google Cast integration
  const googleCast = useGoogleCast();

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
      // Check if we should use Cast or local playback
      if (googleCast.isConnected) {
        // Check if the URI is a local file (which Google Cast cannot access)
        const isLocalFile = song.uri.startsWith('file://') || 
                           song.uri.startsWith('/') || 
                           !song.uri.startsWith('http://') && !song.uri.startsWith('https://');
        
        if (isLocalFile) {
          console.warn('Cannot cast local files. Google Cast requires HTTP/HTTPS URLs. Falling back to local playback.');
          // Alert.alert can be added here if you want user notification
          // For now, just fall through to local playback
        } else {
          try {
            // Stop local playback if active
            if (soundRef.current) {
              await soundRef.current.unloadAsync();
              soundRef.current = null;
            }
            if (positionUpdateInterval.current) {
              clearInterval(positionUpdateInterval.current);
            }

            // Cast to Google Home
            await googleCast.castAudio({
              contentUrl: song.uri,
              contentType: 'audio/mp3',
              title: song.title,
              artist: song.artist,
              albumArt: song.albumArt,
              streamDuration: song.duration,
            });

            usingCastRef.current = true;
            setPlaybackState({
              ...playbackState,
              currentSong: song,
              isPlaying: true,
              queue: queue || [song],
              currentIndex: startIndex ?? 0,
              position: 0,
            });
            startCastPositionUpdates();
            return; // Successfully casted
          } catch (castError) {
            console.error('Cast failed, falling back to local playback:', castError);
            // Fall through to local playback
          }
        }
      }
      
      // Play locally using expo-av
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: song.uri },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      usingCastRef.current = false;
      
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
      if (usingCastRef.current && googleCast.isConnected) {
        // Control Cast playback
        if (playbackState.isPlaying) {
          await googleCast.pause();
        } else {
          await googleCast.play();
        }
        setPlaybackState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
      } else {
        // Control local playback
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
      if (usingCastRef.current && googleCast.isConnected) {
        await googleCast.seek(position);
        setPlaybackState((prev) => ({ ...prev, position }));
      } else {
        if (!soundRef.current) return;
        await soundRef.current.setPositionAsync(position * 1000);
        setPlaybackState((prev) => ({ ...prev, position }));
      }
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

  // Position updates for Cast playback
  const startCastPositionUpdates = () => {
    if (positionUpdateInterval.current) {
      clearInterval(positionUpdateInterval.current);
    }
    positionUpdateInterval.current = setInterval(() => {
      if (googleCast && googleCast.isConnected) {
        try {
          setPlaybackState((prev) => ({
            ...prev,
            position: googleCast.currentPosition || 0,
            duration: googleCast.duration || 0,
            isPlaying: googleCast.isPlaying || false,
          }));

          // Auto-advance if ended
          if (googleCast.duration > 0 && googleCast.currentPosition >= googleCast.duration - 1) {
            nextSong();
          }
        } catch (error) {
          console.error('Error updating Cast position:', error);
        }
      }
    }, 1000);
  };

  // Cast the current song to Google Home
  const castCurrentSong = async () => {
    if (!playbackState.currentSong) {
      console.warn('No song currently playing');
      return;
    }

    if (!googleCast.isConnected) {
      console.warn('Not connected to a Cast device');
      return;
    }

    const currentSong = playbackState.currentSong;
    
    // Check if the URI is a local file (which Google Cast cannot access)
    const isLocalFile = currentSong.uri.startsWith('file://') || 
                       currentSong.uri.startsWith('/') || 
                       !currentSong.uri.startsWith('http://') && !currentSong.uri.startsWith('https://');
    
    if (isLocalFile) {
      console.error('Cannot cast local files. Google Cast requires HTTP/HTTPS URLs from streaming services.');
      throw new Error('Cannot cast local files. Google Cast requires publicly accessible HTTP/HTTPS URLs.');
    }

    try {
      // Get current position before stopping local playback
      const currentPos = playbackState.position;

      // Stop local playback
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      if (positionUpdateInterval.current) {
        clearInterval(positionUpdateInterval.current);
      }

      // Start casting
      await googleCast.castAudio({
        contentUrl: currentSong.uri,
        contentType: 'audio/mp3',
        title: currentSong.title,
        artist: currentSong.artist,
        albumArt: currentSong.albumArt,
        streamDuration: currentSong.duration,
        startTime: currentPos,
      });

      usingCastRef.current = true;
      setPlaybackState((prev) => ({ ...prev, isPlaying: true }));
      startCastPositionUpdates();
    } catch (error) {
      console.error('Error casting song:', error);
      // Resume local playback on error
      if (playbackState.currentSong) {
        try {
          const { sound } = await Audio.Sound.createAsync(
            { uri: playbackState.currentSong.uri },
            { shouldPlay: true, positionMillis: playbackState.position * 1000 },
            onPlaybackStatusUpdate
          );
          soundRef.current = sound;
          usingCastRef.current = false;
          startPositionUpdates();
        } catch (resumeError) {
          console.error('Error resuming playback:', resumeError);
        }
      }
      throw error;
    }
  };

  // Handle Cast disconnection - switch back to local playback
  useEffect(() => {
    if (!googleCast || !googleCast.isConnected) {
      if (usingCastRef.current && playbackState.currentSong) {
        // Cast disconnected, resume local playback
        const resumeLocalPlayback = async () => {
          const currentPos = playbackState.position;
          usingCastRef.current = false;
          
          try {
            const { sound } = await Audio.Sound.createAsync(
              { uri: playbackState.currentSong!.uri },
              { shouldPlay: true, positionMillis: currentPos * 1000 },
              onPlaybackStatusUpdate
            );
            soundRef.current = sound;
            startPositionUpdates();
          } catch (error) {
            console.error('Error resuming local playback:', error);
          }
        };
        resumeLocalPlayback();
      }
    }
  }, [googleCast?.isConnected]);

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
        isCastConnected: googleCast.isConnected,
        castDeviceName: googleCast.deviceName,
        castCurrentSong,
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
