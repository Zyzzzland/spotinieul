import { useFlashcards } from '@/contexts/flashcard-context';
import { useAppColors, useThemeColors } from '@/hooks/use-theme-color';
import type { Flashcard } from '@/types/flashcard';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function StudyModeScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getTopicById, markFlashcardReviewed } = useFlashcards();

  const colors = useAppColors();
  const themeColors = useThemeColors();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flipAnimation] = useState(new Animated.Value(0));
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([]);
  const [startWithFront, setStartWithFront] = useState(true);
  const [showStartModal, setShowStartModal] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  const topic = getTopicById(id as string);

  useEffect(() => {
    if (topic && topic.flashcards.length > 0) {
      // Shuffle the flashcards
      const shuffled = [...topic.flashcards].sort(() => Math.random() - 0.5);
      setShuffledCards(shuffled);
    }
  }, [topic]);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
    flipAnimation.setValue(0);
  }, [currentIndex]);

  const handleStartStudy = (useFront: boolean) => {
    setStartWithFront(useFront);
    setShowStartModal(false);
    setHasStarted(true);
  };

  if (!topic) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={32} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.errorText, { color: colors.text }]}>Topic not found</Text>
        </View>
      </View>
    );
  }

  if (shuffledCards.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={32} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="layers-outline" size={64} color={colors.icon} />
          <Text style={[styles.emptyText, { color: colors.icon }]}>
            No flashcards to study
          </Text>
        </View>
      </View>
    );
  }

  const currentCard = shuffledCards[currentIndex];
  const isLastCard = currentIndex === shuffledCards.length - 1;
  const progress = ((currentIndex + 1) / shuffledCards.length) * 100;

  const handleFlip = () => {
    Animated.timing(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (isLastCard) return; // Don't do anything if at last card

    // Mark as reviewed (non-blocking)
    markFlashcardReviewed(topic.id, currentCard.id);
    
    // Move to next card (useEffect will reset flip state)
    setCurrentIndex(prev => prev + 1);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      // Move to previous card (useEffect will reset flip state)
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    flipAnimation.setValue(0);
    // Re-shuffle
    const shuffled = [...topic.flashcards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  if (!hasStarted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={32} color={colors.text} />
          </TouchableOpacity>
        </View>
        <Modal
          visible={showStartModal}
          transparent
          animationType="fade"
        >
          <View style={styles.startModalOverlay}>
            <View style={[styles.startModalContent, { backgroundColor: colors.background }]}>
              <Ionicons name="school" size={64} color={themeColors.primary} />
              <Text style={[styles.startModalTitle, { color: colors.text }]}>
                Choose Starting Side
              </Text>
              <Text style={[styles.startModalSubtitle, { color: colors.icon }]}>
                How would you like to study?
              </Text>

              <TouchableOpacity
                style={[styles.startOptionButton, { backgroundColor: themeColors.primary }]}
                onPress={() => handleStartStudy(true)}
              >
                <Ionicons name="document-text" size={28} color="#fff" />
                <View style={styles.startOptionText}>
                  <Text style={styles.startOptionTitle}>Start with Front</Text>
                  <Text style={styles.startOptionDesc}>Show question first</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.startOptionButton, { backgroundColor: '#3498DB' }]}
                onPress={() => handleStartStudy(false)}
              >
                <Ionicons name="reader" size={28} color="#fff" />
                <View style={styles.startOptionText}>
                  <Text style={styles.startOptionTitle}>Start with Back</Text>
                  <Text style={styles.startOptionDesc}>Show answer first</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={32} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.topicName, { color: colors.text }]} numberOfLines={1}>
            {topic.name}
          </Text>
          <Text style={[styles.cardProgress, { color: colors.icon }]}>
            Card {currentIndex + 1} of {shuffledCards.length}
          </Text>
        </View>
        <TouchableOpacity onPress={handleRestart} style={styles.restartButton}>
          <Ionicons name="refresh" size={28} color={colors.icon} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBarContainer, { backgroundColor: colors.icon + '30' }]}>
        <View
          style={[
            styles.progressBar,
            { width: `${progress}%`, backgroundColor: themeColors.primary },
          ]}
        />
      </View>

      {/* Flashcard */}
      <View style={styles.cardContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleFlip}
          style={styles.cardTouchable}
          key={currentCard.id}
        >
          <View style={styles.cardWrapper}>
            {/* Front of card */}
            <Animated.View
              style={[
                styles.card,
                {
                  backgroundColor: startWithFront ? themeColors.backgroundCard : themeColors.primary,
                  transform: [{ rotateY: frontInterpolate }],
                  opacity: frontOpacity,
                  borderColor: themeColors.primary, 
                  borderWidth: 1
                },
              ]}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>{startWithFront ? 'FRONT' : 'BACK'}</Text>
                <Text style={styles.cardText}>{startWithFront ? currentCard.front : currentCard.back}</Text>
                <View style={styles.flipHint}>
                  <Ionicons name="sync" size={20} color="#fff" />
                  <Text style={styles.flipHintText}>Tap to flip</Text>
                </View>
              </View>
            </Animated.View>

            {/* Back of card */}
            <Animated.View
              style={[
                styles.card,
                styles.cardBack,
                {
                  backgroundColor: startWithFront ? themeColors.primary : themeColors.backgroundCard,
                  transform: [{ rotateY: backInterpolate }],
                  opacity: backOpacity,
                },
              ]}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>{startWithFront ? 'BACK' : 'FRONT'}</Text>
                <Text style={styles.cardText}>{startWithFront ? currentCard.back : currentCard.front}</Text>
                <View style={styles.flipHint}>
                  <Ionicons name="sync" size={20} color="#fff" />
                  <Text style={styles.flipHintText}>Tap to flip</Text>
                </View>
              </View>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handlePrevious}
          disabled={currentIndex === 0}
          style={[
            styles.navButton,
            { backgroundColor: themeColors.backgroundCard },
            currentIndex === 0 && styles.disabledButton,
          ]}
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color={currentIndex === 0 ? '#666' : '#fff'}
          />
          <Text
            style={[
              styles.navButtonText,
              currentIndex === 0 && styles.disabledButtonText,
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNext}
          disabled={isLastCard}
          style={[
            styles.navButton,
            styles.nextButton,
            !isLastCard && { backgroundColor: themeColors.primary },
            isLastCard && styles.disabledButton,
          ]}
        >
          <Text style={[styles.navButtonText, isLastCard && styles.disabledButtonText]}>
            Next
          </Text>
          <Ionicons
            name="chevron-forward"
            size={28}
            color={isLastCard ? '#666' : '#fff'}
          />
        </TouchableOpacity>
      </View>
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
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
  },
  topicName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardProgress: {
    fontSize: 14,
    marginTop: 2,
  },
  restartButton: {
    padding: 4,
  },
  progressBarContainer: {
    height: 4,
    marginHorizontal: 16,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardTouchable: {
    width: '100%',
    aspectRatio: 3 / 4,
    maxHeight: 500,
  },
  cardWrapper: {
    flex: 1,
    position: 'relative',
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    borderStyle: 'dashed'
  },
  cardBack: {
    position: 'absolute',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  cardLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 20,
    opacity: 0.9,
  },
  cardText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 34,
  },
  flipHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    opacity: 0.7,
  },
  flipHintText: {
    color: '#fff',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButton: {
    // backgroundColor will be set dynamically
  },
  disabledButton: {
    backgroundColor: '#3a3a3a',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
  },
  startModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  startModalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  startModalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  startModalSubtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  startOptionButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  startOptionText: {
    flex: 1,
  },
  startOptionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  startOptionDesc: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
});
