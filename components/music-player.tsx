import { useMusic } from '@/contexts/music-context';
import { useAppColors, useThemeColors } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

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
  } = useMusic();

  const colors = useAppColors();
  const themeColors = useThemeColors();

  const { currentSong, isPlaying, position, duration, repeatMode, shuffleMode } = playbackState;

  if (!currentSong) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
          minimumTrackTintColor={themeColors.primary}
          maximumTrackTintColor={colors.icon + '40'}
          thumbTintColor={themeColors.primary}
        />
        <Text style={[styles.timeText, { color: colors.icon }]}>{formatTime(duration)}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.secondaryControls}>
          <TouchableOpacity
            onPress={toggleShuffle}
            style={[
              styles.iconButton,
              shuffleMode && { backgroundColor: themeColors.primaryRgba(0.1) },
            ]}
          >
            <Ionicons
              name="shuffle"
              size={24}
              color={shuffleMode ? themeColors.primary : colors.icon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleRepeat}
            style={[
              styles.iconButton,
              repeatMode !== 'off' && { backgroundColor: themeColors.primaryRgba(0.1) },
            ]}
          >
            <Ionicons
              name={repeatMode === 'one' ? 'repeat-outline' : 'repeat'}
              size={24}
              color={repeatMode !== 'off' ? themeColors.primary : colors.icon}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.mainControls}>
          <TouchableOpacity onPress={previousSong} style={styles.controlButton}>
            <View
              style={[
                styles.controlButtonCircle,
                { backgroundColor: themeColors.primaryDark },
              ]}
            >
              <Ionicons name="play-skip-back" size={28} color="#fff" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
            <View
              style={[
                styles.playButtonCircle,
                {
                  backgroundColor: themeColors.primary,
                  shadowColor: themeColors.primary,
                },
              ]}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={32}
                color="#fff"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={nextSong} style={styles.controlButton}>
            <View
              style={[
                styles.controlButtonCircle,
                { backgroundColor: themeColors.primaryDark },
              ]}
            >
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
  controlButton: {
    padding: 8,
  },
  controlButtonCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    // backgroundColor will be set dynamically
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
    // backgroundColor and shadowColor will be set dynamically
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
