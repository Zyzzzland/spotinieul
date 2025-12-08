import { useFlashcards } from '@/contexts/flashcard-context';
import { useAppColors, useThemeColors } from '@/hooks/use-theme-color';
import type { Topic } from '@/types/flashcard';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function FlashcardsScreen() {
  const { topics, createTopic, deleteTopic } = useFlashcards();
  const colors = useAppColors();
  const themeColors = useThemeColors();
  const router = useRouter();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');

  const handleCreateTopic = async () => {
    if (!newTopicName.trim()) {
      Alert.alert('Error', 'Please enter a topic name');
      return;
    }

    await createTopic(newTopicName.trim(), newTopicDesc.trim() || undefined);
    setNewTopicName('');
    setNewTopicDesc('');
    setShowCreateModal(false);
  };

  const handleDeleteTopic = (topic: Topic) => {
    Alert.alert(
      'Delete Topic',
      `Are you sure you want to delete "${topic.name}"? This will delete all flashcards in this topic.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTopic(topic.id),
        },
      ]
    );
  };

  const renderTopicItem = ({ item }: { item: Topic }) => {
    return (
      <View style={[styles.topicItem, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={styles.topicTouchable}
          onPress={() => router.push(`/topic/${item.id}` as any)}
        >
          <View style={[styles.topicIcon, { backgroundColor: themeColors.primaryLight }]}>
            <Ionicons name="folder" size={32} color={themeColors.primary} />
          </View>

          <View style={styles.topicInfo}>
            <Text style={[styles.topicName, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            {item.description && (
              <Text style={[styles.topicDesc, { color: colors.icon }]} numberOfLines={1}>
                {item.description}
              </Text>
            )}
            <Text style={[styles.cardCount, { color: colors.icon }]}>
              {item.flashcards.length} {item.flashcards.length === 1 ? 'card' : 'cards'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            if (item.flashcards.length === 0) {
              Alert.alert('No Cards', 'Add some flashcards to this topic first');
              return;
            }
            router.push(`/study/${item.id}` as any);
          }}
          style={styles.studyButton}
        >
          <Ionicons name="school" size={24} color={themeColors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            handleDeleteTopic(item);
          }}
          style={styles.deleteButton}
        >
          <Ionicons name="trash" size={22} color="#E74C3C" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Flashcards</Text>
        <TouchableOpacity
          onPress={() => setShowCreateModal(true)}
          style={[styles.addButton, { backgroundColor: themeColors.primary }]}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>New Topic</Text>
        </TouchableOpacity>
      </View>

      {topics.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="school-outline" size={64} color={colors.icon} />
          <Text style={[styles.emptyText, { color: colors.icon }]}>
            No topics yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.icon }]}>
            Create a topic to start adding flashcards
          </Text>
        </View>
      ) : (
        <FlatList
          data={topics}
          keyExtractor={(item) => item.id}
          renderItem={renderTopicItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Create Topic Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Create Topic
            </Text>

            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.icon }]}
              placeholder="Topic Name"
              placeholderTextColor={colors.icon}
              value={newTopicName}
              onChangeText={setNewTopicName}
              autoFocus
            />

            <TextInput
              style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.icon }]}
              placeholder="Description (Optional)"
              placeholderTextColor={colors.icon}
              value={newTopicDesc}
              onChangeText={setNewTopicDesc}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewTopicName('');
                  setNewTopicDesc('');
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.createButton, { backgroundColor: themeColors.primary }]}
                onPress={handleCreateTopic}
              >
                <Text style={styles.buttonText}>Create</Text>
              </TouchableOpacity>
            </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  topicTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicIcon: {
    width: 72,
    height: 72,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicInfo: {
    flex: 1,
    marginLeft: 12,
  },
  topicName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  topicDesc: {
    fontSize: 14,
    marginBottom: 4,
  },
  cardCount: {
    fontSize: 12,
  },
  studyButton: {
    marginRight: 8,
    padding: 6,
  },
  deleteButton: {
    padding: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: 12,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  createButton: {
    // backgroundColor will be set dynamically
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
