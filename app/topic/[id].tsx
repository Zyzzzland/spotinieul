import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFlashcards } from '@/contexts/flashcard-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import type { Flashcard } from '@/types/flashcard';

export default function TopicDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getTopicById, addFlashcard, deleteFlashcard, updateFlashcard } = useFlashcards();

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const topic = getTopicById(id as string);

  if (!topic) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.errorText, { color: colors.text }]}>Topic not found</Text>
        </View>
      </View>
    );
  }

  const handleCreateFlashcard = async () => {
    if (!cardFront.trim() || !cardBack.trim()) {
      Alert.alert('Error', 'Please fill in both sides of the flashcard');
      return;
    }

    await addFlashcard(topic.id, cardFront.trim(), cardBack.trim());
    setCardFront('');
    setCardBack('');
    setShowCreateModal(false);
  };

  const handleEditFlashcard = async () => {
    if (!editingCard || !cardFront.trim() || !cardBack.trim()) {
      Alert.alert('Error', 'Please fill in both sides of the flashcard');
      return;
    }

    await updateFlashcard(topic.id, editingCard.id, cardFront.trim(), cardBack.trim());
    setCardFront('');
    setCardBack('');
    setEditingCard(null);
    setShowEditModal(false);
  };

  const handleDeleteFlashcard = (card: Flashcard) => {
    Alert.alert(
      'Delete Flashcard',
      'Are you sure you want to delete this flashcard?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteFlashcard(topic.id, card.id),
        },
      ]
    );
  };

  const openEditModal = (card: Flashcard) => {
    setEditingCard(card);
    setCardFront(card.front);
    setCardBack(card.back);
    setShowEditModal(true);
  };

  const toggleCardFlip = (cardId: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const renderFlashcardItem = ({ item }: { item: Flashcard }) => {
    const isFlipped = flippedCards.has(item.id);

    return (
      <View style={[styles.cardContainer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: isFlipped ? '#1DB954' : '#2E2E2E' }]}
          onPress={() => toggleCardFlip(item.id)}
          activeOpacity={0.8}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>
              {isFlipped ? 'Back' : 'Front'}
            </Text>
            <Text style={styles.cardText}>
              {isFlipped ? item.back : item.front}
            </Text>
            <Text style={styles.tapHint}>
              Tap to {isFlipped ? 'flip back' : 'reveal'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={() => openEditModal(item)}
            style={[styles.actionButton, { backgroundColor: '#3498DB' }]}
          >
            <Ionicons name="pencil" size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDeleteFlashcard(item)}
            style={[styles.actionButton, { backgroundColor: '#E74C3C' }]}
          >
            <Ionicons name="trash" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {topic.name}
        </Text>
        <TouchableOpacity
          onPress={() => setShowCreateModal(true)}
          style={[styles.addButton, { backgroundColor: '#1DB954' }]}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {topic.description && (
        <View style={styles.descriptionContainer}>
          <Text style={[styles.description, { color: colors.icon }]}>
            {topic.description}
          </Text>
        </View>
      )}

      <View style={styles.statsContainer}>
        <Text style={[styles.statsText, { color: colors.icon }]}>
          {topic.flashcards.length} {topic.flashcards.length === 1 ? 'card' : 'cards'}
        </Text>
        {topic.flashcards.length > 0 && (
          <TouchableOpacity
            onPress={() => router.push(`/study/${topic.id}` as any)}
            style={[styles.studyButton, { backgroundColor: '#1DB954' }]}
          >
            <Ionicons name="school" size={20} color="#fff" />
            <Text style={styles.studyButtonText}>Study Mode</Text>
          </TouchableOpacity>
        )}
      </View>

      {topic.flashcards.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="layers-outline" size={64} color={colors.icon} />
          <Text style={[styles.emptyText, { color: colors.icon }]}>
            No flashcards yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.icon }]}>
            Tap the + button to create your first flashcard
          </Text>
        </View>
      ) : (
        <FlatList
          data={topic.flashcards}
          keyExtractor={(item) => item.id}
          renderItem={renderFlashcardItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Create Flashcard Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Create Flashcard
              </Text>

              <Text style={[styles.inputLabel, { color: colors.icon }]}>Front (Question/Prompt)</Text>
              <TextInput
                style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.icon }]}
                placeholder="Enter the front of the card..."
                placeholderTextColor={colors.icon}
                value={cardFront}
                onChangeText={setCardFront}
                multiline
                numberOfLines={4}
                autoFocus
              />

              <Text style={[styles.inputLabel, { color: colors.icon }]}>Back (Answer)</Text>
              <TextInput
                style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.icon }]}
                placeholder="Enter the back of the card..."
                placeholderTextColor={colors.icon}
                value={cardBack}
                onChangeText={setCardBack}
                multiline
                numberOfLines={4}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowCreateModal(false);
                    setCardFront('');
                    setCardBack('');
                  }}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.createButton]}
                  onPress={handleCreateFlashcard}
                >
                  <Text style={styles.buttonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Flashcard Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Edit Flashcard
              </Text>

              <Text style={[styles.inputLabel, { color: colors.icon }]}>Front (Question/Prompt)</Text>
              <TextInput
                style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.icon }]}
                placeholder="Enter the front of the card..."
                placeholderTextColor={colors.icon}
                value={cardFront}
                onChangeText={setCardFront}
                multiline
                numberOfLines={4}
                autoFocus
              />

              <Text style={[styles.inputLabel, { color: colors.icon }]}>Back (Answer)</Text>
              <TextInput
                style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.icon }]}
                placeholder="Enter the back of the card..."
                placeholderTextColor={colors.icon}
                value={cardBack}
                onChangeText={setCardBack}
                multiline
                numberOfLines={4}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowEditModal(false);
                    setEditingCard(null);
                    setCardFront('');
                    setCardBack('');
                  }}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.createButton]}
                  onPress={handleEditFlashcard}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
    padding: 16,
    paddingTop: 60,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  description: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statsText: {
    fontSize: 14,
  },
  studyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  studyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    padding: 24,
    minHeight: 180,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    alignItems: 'center',
  },
  cardLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    opacity: 0.8,
  },
  cardText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 26,
  },
  tapHint: {
    color: '#fff',
    fontSize: 12,
    marginTop: 12,
    opacity: 0.7,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  errorText: {
    fontSize: 18,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
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
    backgroundColor: '#1DB954',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
