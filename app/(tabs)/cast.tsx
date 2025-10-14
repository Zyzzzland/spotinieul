import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { AudioCastPlayer } from '@/components/audio-cast-player';

export default function CastScreen() {
  // Example audio tracks
  const exampleTracks = [
    {
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      title: 'SoundHelix Song 1',
      artist: 'SoundHelix',
      albumArt: 'https://via.placeholder.com/300x300.png?text=Album+Art',
      contentType: 'audio/mp3',
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Google Cast Audio</ThemedText>
          <ThemedText style={styles.subtitle}>
            Cast your music to Google Home or Chromecast Audio devices
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.content}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Example Track
          </ThemedText>
          
          <AudioCastPlayer
            audioUrl={exampleTracks[0].audioUrl}
            title={exampleTracks[0].title}
            artist={exampleTracks[0].artist}
            albumArt={exampleTracks[0].albumArt}
            contentType={exampleTracks[0].contentType}
          />

          <ThemedView style={styles.instructions}>
            <ThemedText type="defaultSemiBold" style={styles.instructionTitle}>
              How to use:
            </ThemedText>
            <ThemedText style={styles.instructionText}>
              1. Tap the Cast button at the top of the player
            </ThemedText>
            <ThemedText style={styles.instructionText}>
              2. Select your Google Home or Chromecast device
            </ThemedText>
            <ThemedText style={styles.instructionText}>
              3. Tap "Cast Audio" to start streaming
            </ThemedText>
            <ThemedText style={styles.instructionText}>
              4. Use the controls to play, pause, or stop
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.note}>
            <ThemedText type="defaultSemiBold">Note:</ThemedText>
            <ThemedText style={styles.noteText}>
              Make sure your device and Google Home are on the same Wi-Fi network.
              This feature requires a custom Expo build (not Expo Go).
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  instructions: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    gap: 8,
  },
  instructionTitle: {
    marginBottom: 8,
  },
  instructionText: {
    marginLeft: 8,
    lineHeight: 20,
  },
  note: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,193,7,0.1)',
    gap: 8,
  },
  noteText: {
    lineHeight: 20,
    opacity: 0.8,
  },
});
