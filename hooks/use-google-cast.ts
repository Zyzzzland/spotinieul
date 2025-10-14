import { useEffect, useState } from 'react';

// Conditionally import Google Cast modules
let useRemoteMediaClient: any;
let useCastSession: any;
let CastState: any;
let useCastState: any;
let MediaInfo: any;

try {
  const googleCast = require('react-native-google-cast');
  useRemoteMediaClient = googleCast.useRemoteMediaClient;
  useCastSession = googleCast.useCastSession;
  CastState = googleCast.CastState;
  useCastState = googleCast.useCastState;
  MediaInfo = googleCast.MediaInfo;
} catch (e) {
  // Google Cast not available - create mock hooks
  useRemoteMediaClient = () => null;
  useCastSession = () => null;
  useCastState = () => 0;
  CastState = { CONNECTED: 4, NOT_CONNECTED: 1, CONNECTING: 2, NO_DEVICES_AVAILABLE: 0 };
  console.log('Google Cast hooks not available - running in Expo Go');
}

export interface AudioCastOptions {
  contentUrl: string;
  contentType?: string;
  title?: string;
  subtitle?: string;
  artist?: string;
  albumArt?: string;
  streamDuration?: number;
  startTime?: number;
}

export function useGoogleCast() {
  const client = useRemoteMediaClient();
  const castSession = useCastSession();
  const castState = useCastState();
  const [isConnected, setIsConnected] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setIsConnected(castState === CastState.CONNECTED);
  }, [castState]);

  useEffect(() => {
    if (!client) return;

    const updateMediaStatus = () => {
      const mediaStatus = client.mediaStatus;
      if (mediaStatus) {
        setIsPlaying(mediaStatus.playerState === 2); // 2 = PLAYING
        setCurrentPosition(mediaStatus.streamPosition || 0);
        setDuration(mediaStatus.mediaInfo?.streamDuration || 0);
      }
    };

    // Set up interval to update status
    const interval = setInterval(updateMediaStatus, 1000);
    updateMediaStatus();

    return () => clearInterval(interval);
  }, [client]);

  /**
   * Cast audio to Google Home device
   */
  const castAudio = async (options: AudioCastOptions) => {
    if (!client) {
      throw new Error('No cast client available. Make sure you are connected to a Cast device.');
    }

    const mediaInfo: any = {
      contentUrl: options.contentUrl,
      contentType: options.contentType || 'audio/mp3',
      metadata: {
        type: 'musicTrack',
        title: options.title,
        subtitle: options.subtitle,
        artist: options.artist,
        images: options.albumArt ? [{ url: options.albumArt }] : undefined,
      },
      streamDuration: options.streamDuration,
    };

    try {
      await client.loadMedia({
        mediaInfo,
        startTime: options.startTime || 0,
        autoplay: true,
      });
      setIsPlaying(true);
    } catch (error) {
      console.error('Error casting audio:', error);
      throw error;
    }
  };

  /**
   * Play the current media
   */
  const play = async () => {
    if (client) {
      await client.play();
      setIsPlaying(true);
    }
  };

  /**
   * Pause the current media
   */
  const pause = async () => {
    if (client) {
      await client.pause();
      setIsPlaying(false);
    }
  };

  /**
   * Stop casting and disconnect
   */
  const stop = async () => {
    if (client) {
      await client.stop();
      setIsPlaying(false);
    }
  };

  /**
   * Seek to a specific position in seconds
   */
  const seek = async (position: number) => {
    if (client) {
      await client.seek({ position });
      setCurrentPosition(position);
    }
  };

  /**
   * Get the current device name
   */
  const getDeviceName = () => {
    return castSession?.device?.friendlyName || null;
  };

  return {
    // State
    isConnected,
    isPlaying,
    currentPosition,
    duration,
    deviceName: getDeviceName(),

    // Methods
    castAudio,
    play,
    pause,
    stop,
    seek,
  };
}
