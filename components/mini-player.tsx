import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Pressable,
} from 'react-native';
import { useMusic } from '@/contexts/music-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';

export function MiniPlayer() {
  const { playbackState, togglePlayPause, nextSong } = useMusic();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const { currentSong, isPlaying, position, duration } = playbackState;

  if (!currentSong) {
    return null;
  }

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <Pressable
      onPress={() => router.push('/player')}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View
          style={[styles.progress, { width: `${progress}%`, backgroundColor: '#1DB954' }]}
        />
      </View>

      <View style={styles.content}>
        {/* Album Art */}
        {currentSong.albumArt ? (
          <Image source={{ uri: currentSong.albumArt }} style={styles.albumArt} />
        ) : (
          <View style={[styles.albumArtPlaceholder, { backgroundColor: colors.icon + '30' }]}>
            <Ionicons name="musical-notes" size={20} color={colors.icon} />
          </View>
        )}

        {/* Song Info */}
        <View style={styles.songInfo}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={[styles.artist, { color: colors.icon }]} numberOfLines={1}>
            {currentSong.artist}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            style={styles.playButton}
          >
            <View style={styles.playButtonCircle}>
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={18}
                color="#fff"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              nextSong();
            }}
            style={styles.nextButton}
          >
            <View style={styles.nextButtonCircle}>
              <Ionicons name="play-skip-forward" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  progressBar: {
    height: 2,
    backgroundColor: '#E0E0E0',
  },
  progress: {
    height: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 12,
  },
  albumArt: {
    width: 48,
    height: 48,
    borderRadius: 4,
  },
  albumArtPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  artist: {
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playButton: {
    padding: 0,
  },
  playButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    padding: 0,
  },
  nextButtonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(29, 185, 84, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
