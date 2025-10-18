import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Topic, Flashcard } from '@/types/flashcard';

interface FlashcardContextType {
  topics: Topic[];
  createTopic: (name: string, description?: string) => Promise<void>;
  deleteTopic: (topicId: string) => Promise<void>;
  updateTopic: (topicId: string, name: string, description?: string) => Promise<void>;
  getTopicById: (topicId: string) => Topic | undefined;
  addFlashcard: (topicId: string, front: string, back: string) => Promise<void>;
  deleteFlashcard: (topicId: string, flashcardId: string) => Promise<void>;
  updateFlashcard: (topicId: string, flashcardId: string, front: string, back: string) => Promise<void>;
  markFlashcardReviewed: (topicId: string, flashcardId: string) => Promise<void>;
  loading: boolean;
}

const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

const STORAGE_KEY = '@flashcard_topics';

export function FlashcardProvider({ children }: { children: ReactNode }) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  // Load topics from storage
  useEffect(() => {
    loadTopics();
  }, []);

  // Save topics to storage whenever they change
  useEffect(() => {
    if (!loading) {
      saveTopics();
    }
  }, [topics, loading]);

  const loadTopics = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setTopics(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTopics = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
    } catch (error) {
      console.error('Error saving topics:', error);
    }
  };

  const createTopic = async (name: string, description?: string) => {
    const newTopic: Topic = {
      id: Date.now().toString(),
      name,
      description,
      flashcards: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setTopics(prev => [...prev, newTopic]);
  };

  const deleteTopic = async (topicId: string) => {
    setTopics(prev => prev.filter(t => t.id !== topicId));
  };

  const updateTopic = async (topicId: string, name: string, description?: string) => {
    setTopics(prev =>
      prev.map(t =>
        t.id === topicId
          ? { ...t, name, description, updatedAt: Date.now() }
          : t
      )
    );
  };

  const getTopicById = (topicId: string) => {
    return topics.find(t => t.id === topicId);
  };

  const addFlashcard = async (topicId: string, front: string, back: string) => {
    const newFlashcard: Flashcard = {
      id: Date.now().toString(),
      front,
      back,
      createdAt: Date.now(),
    };

    setTopics(prev =>
      prev.map(t =>
        t.id === topicId
          ? {
              ...t,
              flashcards: [...t.flashcards, newFlashcard],
              updatedAt: Date.now(),
            }
          : t
      )
    );
  };

  const deleteFlashcard = async (topicId: string, flashcardId: string) => {
    setTopics(prev =>
      prev.map(t =>
        t.id === topicId
          ? {
              ...t,
              flashcards: t.flashcards.filter(f => f.id !== flashcardId),
              updatedAt: Date.now(),
            }
          : t
      )
    );
  };

  const updateFlashcard = async (
    topicId: string,
    flashcardId: string,
    front: string,
    back: string
  ) => {
    setTopics(prev =>
      prev.map(t =>
        t.id === topicId
          ? {
              ...t,
              flashcards: t.flashcards.map(f =>
                f.id === flashcardId ? { ...f, front, back } : f
              ),
              updatedAt: Date.now(),
            }
          : t
      )
    );
  };

  const markFlashcardReviewed = async (topicId: string, flashcardId: string) => {
    setTopics(prev =>
      prev.map(t =>
        t.id === topicId
          ? {
              ...t,
              flashcards: t.flashcards.map(f =>
                f.id === flashcardId ? { ...f, lastReviewed: Date.now() } : f
              ),
            }
          : t
      )
    );
  };

  return (
    <FlashcardContext.Provider
      value={{
        topics,
        createTopic,
        deleteTopic,
        updateTopic,
        getTopicById,
        addFlashcard,
        deleteFlashcard,
        updateFlashcard,
        markFlashcardReviewed,
        loading,
      }}
    >
      {children}
    </FlashcardContext.Provider>
  );
}

export function useFlashcards() {
  const context = useContext(FlashcardContext);
  if (!context) {
    throw new Error('useFlashcards must be used within a FlashcardProvider');
  }
  return context;
}
