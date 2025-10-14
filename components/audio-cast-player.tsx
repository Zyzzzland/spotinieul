import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';

let CastButton: any = null;
try {
  // Only import if native module is available
  CastButton = require('react-native-google-cast').CastButton;
} catch (e) {
  console.log('Google Cast not available - running in Expo Go');
}
import { useGoogleCast } from '@/hooks/use-google-cast';
import type { AudioCastOptions } from '@/hooks/use-google-cast';

interface AudioCastPlayerProps {
  audioUrl: string;
  title?: string;
  artist?: string;
  albumArt?: string;
  contentType?: string;
}

export function AudioCastPlayer({
  audioUrl,
  title = 'Unknown Track',
  artist = 'Unknown Artist',
  albumArt,
  contentType = 'audio/mp3',
}: AudioCastPlayerProps) {
  const {
    isConnected,
    isPlaying,
    currentPosition,
    duration,
    deviceName,
    castAudio,
    play,
    pause,
    stop,
  } = useGoogleCast();

  const [isLoading, setIsLoading] = useState(false);

  const handleCastAudio = async () => {
    setIsLoading(true);
    try {
      const options: AudioCastOptions = {
        contentUrl: audioUrl,
        contentType,
        title,
        artist,
        albumArt,
      };
      await castAudio(options);
    } catch (error) {
      console.error('Failed to cast audio:', error);
      alert('Failed to cast audio. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Cast Button */}
      <View style={styles.castButtonContainer}>
        {CastButton ? (
          <>
            <CastButton style={styles.castButton} />
            {isConnected && deviceName && (
              <Text style={styles.deviceName}>Connected to {deviceName}</Text>
            )}
          </>
        ) : (
          <View style={styles.unavailableContainer}>
            <Text style={styles.unavailableText}>⚠️ Google Cast Unavailable</Text>
            <Text style={styles.unavailableHint}>
              Build with 'npm run android' to enable casting
            </Text>
          </View>
        )}
      </View>

      {/* Album Art */}
      {albumArt && (
        <Image source={{ uri: albumArt }} style={styles.albumArt} />
      )}

      {/* Track Info */}
      <View style={styles.trackInfo}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.artist}>{artist}</Text>
      </View>

      {/* Controls */}
      {isConnected && (
        <View style={styles.controls}>
          {/* Cast/Load Button */}
          {!isPlaying && duration === 0 && (
            <TouchableOpacity
              style={styles.button}
              onPress={handleCastAudio}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Cast Audio</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Playback Controls */}
          {duration > 0 && (
            <>
              <View style={styles.progressContainer}>
                <Text style={styles.timeText}>{formatTime(currentPosition)}</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progress,
                      { width: `${(currentPosition / duration) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>

              <View style={styles.playbackButtons}>
                {isPlaying ? (
                  <TouchableOpacity style={styles.button} onPress={pause}>
                    <Text style={styles.buttonText}>⏸ Pause</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.button} onPress={play}>
                    <Text style={styles.buttonText}>▶ Play</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={stop}>
                  <Text style={styles.buttonText}>⏹ Stop</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}

      {!isConnected && (
        <Text style={styles.hint}>Tap the Cast button to connect to a device</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  castButtonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  castButton: {
    width: 40,
    height: 40,
    tintColor: '#1DB954',
  },
  deviceName: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  albumArt: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  trackInfo: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  artist: {
    fontSize: 16,
    color: '#666',
  },
  controls: {
    gap: 12,
  },
  button: {
    backgroundColor: '#1DB954',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#E74C3C',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#1DB954',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    minWidth: 40,
  },
  playbackButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  hint: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 12,
  },
  unavailableContainer: {
    padding: 16,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFC107',
    alignItems: 'center',
  },
  unavailableText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  unavailableHint: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
  },
});
