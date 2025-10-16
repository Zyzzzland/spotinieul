import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useMusic } from '@/contexts/music-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

// Conditionally import CastButton
let CastButton: any = null;
try {
  CastButton = require('react-native-google-cast').CastButton;
} catch (e) {
  // Google Cast not available in Expo Go
}

const { width } = Dimensions.get('window');

export function MusicPlayer() {
  const {
    playbackState,
    togglePlayPause,
    nextSong,
    previousSong,
    seekTo,
    toggleRepeat,
    toggleShuffle,
    isCastConnected,
    castDeviceName,
    castCurrentSong,
  } = useMusic();

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isCasting, setIsCasting] = useState(false);

  const { currentSong, isPlaying, position, duration, repeatMode, shuffleMode } = playbackState;

  if (!currentSong) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCastPress = async () => {
    if (!currentSong) return;
    
    if (!isCastConnected) {
      Alert.alert('Not Connected', 'Please connect to a Cast device first using the Cast button.');
      return;
    }

    setIsCasting(true);
    try {
      await castCurrentSong();
    } catch (error) {
      console.error('Error casting:', error);
      Alert.alert('Cast Error', 'Failed to cast music. Please try again.');
    } finally {
      setIsCasting(false);
    }
  };


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Cast Button */}
      <View style={styles.castContainer}>
        {CastButton ? (
          <View style={styles.castButtonWrapper}>
            <CastButton style={styles.castButton} />
            {isCastConnected && castDeviceName && (
              <Text style={[styles.castDeviceText, { color: '#1DB954' }]}>
                🔊 {castDeviceName}
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.castUnavailable}>
            <Text style={styles.castUnavailableText}>Cast unavailable in Expo Go</Text>
          </View>
        )}
      </View>

      {/* Album Art */}
      <View style={styles.albumArtContainer}>
        {currentSong.albumArt ? (
          <Image source={{ uri: currentSong.albumArt }} style={styles.albumArt} />
        ) : (
          <View style={[styles.albumArtPlaceholder, { backgroundColor: colors.icon + '30' }]}>
            <Ionicons name="musical-notes" size={80} color={colors.icon} />
          </View>
        )}
      </View>

      {/* Song Info */}
      <View style={styles.songInfo}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {currentSong.title}
        </Text>
        <Text style={[styles.artist, { color: colors.icon }]} numberOfLines={1}>
          {currentSong.artist}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={[styles.timeText, { color: colors.icon }]}>{formatTime(position)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration || 1}
          value={position}
          onSlidingComplete={seekTo}
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor={colors.icon + '40'}
          thumbTintColor="#1DB954"
        />
        <Text style={[styles.timeText, { color: colors.icon }]}>{formatTime(duration)}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.secondaryControls}>
          <TouchableOpacity
            onPress={toggleShuffle}
            style={[styles.iconButton, shuffleMode && styles.activeButton]}
          >
            <Ionicons
              name="shuffle"
              size={24}
              color={shuffleMode ? '#1DB954' : colors.icon}
            />
          </TouchableOpacity>

          {/* Cast current song button */}
          {isCastConnected && (
            <TouchableOpacity
              onPress={handleCastPress}
              style={[styles.iconButton, styles.castActionButton]}
              disabled={isCasting}
            >
              {isCasting ? (
                <ActivityIndicator size="small" color="#1DB954" />
              ) : (
                <Ionicons name="wifi" size={24} color="#1DB954" />
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={toggleRepeat}
            style={[styles.iconButton, repeatMode !== 'off' && styles.activeButton]}
          >
            <Ionicons
              name={repeatMode === 'one' ? 'repeat-outline' : 'repeat'}
              size={24}
              color={repeatMode !== 'off' ? '#1DB954' : colors.icon}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.mainControls}>
          <TouchableOpacity onPress={previousSong} style={styles.controlButton}>
            <View style={styles.controlButtonCircle}>
              <Ionicons name="play-skip-back" size={28} color="#fff" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
            <View style={styles.playButtonCircle}>
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={32}
                color="#fff"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={nextSong} style={styles.controlButton}>
            <View style={styles.controlButtonCircle}>
              <Ionicons name="play-skip-forward" size={28} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  castContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  castButtonWrapper: {
    alignItems: 'center',
    gap: 8,
  },
  castButton: {
    width: 36,
    height: 36,
    tintColor: '#1DB954',
  },
  castDeviceText: {
    fontSize: 13,
    fontWeight: '600',
  },
  castUnavailable: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  castUnavailableText: {
    fontSize: 11,
    color: '#FFC107',
  },
  castActionButton: {
    backgroundColor: 'rgba(29, 185, 84, 0.15)',
  },
  albumArtContainer: {
    width: width - 80,
    height: width - 80,
    marginBottom: 32,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  albumArt: {
    width: '100%',
    height: '100%',
  },
  albumArtPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  songInfo: {
    width: '100%',
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  artist: {
    fontSize: 18,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  slider: {
    flex: 1,
    marginHorizontal: 12,
  },
  timeText: {
    fontSize: 12,
    minWidth: 45,
    textAlign: 'center',
  },
  controlsContainer: {
    width: '100%',
    gap: 24,
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 8,
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  iconButton: {
    padding: 12,
    borderRadius: 20,
  },
  activeButton: {
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
  },
  controlButton: {
    padding: 8,
  },
  controlButtonCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(29, 185, 84, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    padding: 0,
  },
  playButtonCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
