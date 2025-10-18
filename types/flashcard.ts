export interface Flashcard {
  id: string;
  front: string;
  back: string;
  createdAt: number;
  lastReviewed?: number;
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
  flashcards: Flashcard[];
  createdAt: number;
  updatedAt: number;
}
