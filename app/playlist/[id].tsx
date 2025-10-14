import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMusic } from '@/contexts/music-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import type { Song } from '@/types/music';

export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const {
    getPlaylistById,
    getSongById,
    songs,
    addSongToPlaylist,
    removeSongFromPlaylist,
    playPlaylist,
    playSong,
  } = useMusic();
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [showAddSongModal, setShowAddSongModal] = useState(false);

  const playlist = getPlaylistById(id as string);

  if (!playlist) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Playlist not found</Text>
      </View>
    );
  }

  const playlistSongs = playlist.songs
    .map((songId) => getSongById(songId))
    .filter((song): song is Song => song !== undefined);

  const availableSongs = songs.filter((song) => !playlist.songs.includes(song.id));

  const handleRemoveSong = (songId: string) => {
    Alert.alert(
      'Remove Song',
      'Remove this song from the playlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeSongFromPlaylist(playlist.id, songId),
        },
      ]
    );
  };

  const handleAddSong = (songId: string) => {
    addSongToPlaylist(playlist.id, songId);
    Alert.alert('Success', 'Song added to playlist');
  };

  const handlePlayPlaylist = () => {
    if (playlistSongs.length === 0) {
      Alert.alert('Empty Playlist', 'Add some songs first');
      return;
    }
    playPlaylist(playlist);
    router.push('/player');
  };

  const handlePlaySong = (song: Song) => {
    const index = playlistSongs.indexOf(song);
    playSong(song, playlistSongs, index);
    router.push('/player');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderSongItem = ({ item }: { item: Song }) => (
    <View style={[styles.songItem, { backgroundColor: colors.background }]}>
      {item.albumArt ? (
        <Image source={{ uri: item.albumArt }} style={styles.albumArt} />
      ) : (
        <View style={[styles.albumArtPlaceholder, { backgroundColor: colors.icon + '30' }]}>
          <Ionicons name="musical-notes" size={24} color={colors.icon} />
        </View>
      )}

      <TouchableOpacity
        style={styles.songInfo}
        onPress={() => handlePlaySong(item)}
      >
        <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.songArtist, { color: colors.icon }]} numberOfLines={1}>
          {item.artist}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.duration, { color: colors.icon }]}>
        {formatTime(item.duration)}
      </Text>

      <TouchableOpacity
        onPress={() => handlePlaySong(item)}
        style={styles.playButton}
      >
        <Ionicons name="play-circle" size={36} color="#1DB954" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          handleRemoveSong(item.id);
        }}
        style={styles.removeButton}
      >
        <Ionicons name="remove-circle" size={28} color="#E74C3C" />
      </TouchableOpacity>
    </View>
  );

  const renderAvailableSong = ({ item }: { item: Song }) => (
    <TouchableOpacity
      style={[styles.songItem, { backgroundColor: colors.background }]}
      onPress={() => handleAddSong(item.id)}
    >
      {item.albumArt ? (
        <Image source={{ uri: item.albumArt }} style={styles.albumArt} />
      ) : (
        <View style={[styles.albumArtPlaceholder, { backgroundColor: colors.icon + '30' }]}>
          <Ionicons name="musical-notes" size={24} color={colors.icon} />
        </View>
      )}

      <View style={styles.songInfo}>
        <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.songArtist, { color: colors.icon }]} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>

      <View style={styles.addSongIconButton}>
        <Ionicons name="add" size={20} color="#fff" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {playlist.name}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Playlist Info */}
      <View style={styles.playlistHeader}>
        <View style={[styles.largeCoverArt, { backgroundColor: colors.icon + '30' }]}>
          <Ionicons name="list" size={64} color={colors.icon} />
        </View>
        <Text style={[styles.playlistName, { color: colors.text }]}>{playlist.name}</Text>
        {playlist.description && (
          <Text style={[styles.playlistDesc, { color: colors.icon }]}>
            {playlist.description}
          </Text>
        )}
        <Text style={[styles.songCount, { color: colors.icon }]}>
          {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}
        </Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.playAllButton}
            onPress={handlePlayPlaylist}
          >
            <Ionicons name="play" size={20} color="#fff" />
            <Text style={styles.playAllText}>Play All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addSongButton}
            onPress={() => setShowAddSongModal(true)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addSongText}>Add Songs</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Song List */}
      {playlistSongs.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="musical-notes-outline" size={48} color={colors.icon} />
          <Text style={[styles.emptyText, { color: colors.icon }]}>
            No songs in this playlist
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.icon }]}>
            Tap "Add Songs" to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={playlistSongs}
          keyExtractor={(item) => item.id}
          renderItem={renderSongItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Add Song Modal */}
      <Modal
        visible={showAddSongModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddSongModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Songs</Text>
              <TouchableOpacity onPress={() => setShowAddSongModal(false)}>
                <Ionicons name="close-circle" size={28} color={colors.icon} />
              </TouchableOpacity>
            </View>

            {availableSongs.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Text style={[styles.emptyText, { color: colors.icon }]}>
                  All songs are already in this playlist
                </Text>
              </View>
            ) : (
              <FlatList
                data={availableSongs}
                keyExtractor={(item) => item.id}
                renderItem={renderAvailableSong}
                contentContainerStyle={styles.modalList}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  headerSpacer: {
    width: 36,
  },
  playlistHeader: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 8,
  },
  largeCoverArt: {
    width: 180,
    height: 180,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  playlistName: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  playlistDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  songCount: {
    fontSize: 14,
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DB954',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 8,
  },
  playAllText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addSongButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#666',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 8,
  },
  addSongText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  albumArt: {
    width: 56,
    height: 56,
    borderRadius: 4,
  },
  albumArtPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 14,
  },
  duration: {
    fontSize: 12,
    marginRight: 12,
    minWidth: 40,
  },
  playButton: {
    padding: 4,
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
  addSongIconButton: {
    backgroundColor: '#1DB954',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalList: {
    paddingHorizontal: 16,
  },
  modalEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
