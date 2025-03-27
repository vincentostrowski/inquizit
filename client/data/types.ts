export type Book = {
  _id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
}

export type Insight = {
  _id: string;
  title: string;
  body: string[];
  parentId: string;  // Could be bookId or insightId
  parentType: 'book' | 'insight';
  leaf: boolean;
  bookId: string;    // Direct reference to book for easier querying
  order: number;     // For ordering within same parent
  prompt?: string;   // Optional prompt
} 

export interface Card {
  _id: string;
  type: 'quizit' | 'explanation';
}

export interface Explanation extends Card {
  type: 'explanation';
  insightId: string;
  title: string;
  summary: string;
  explanations: string[];
}

export interface Quizit extends Card {
  type: 'quizit';
  body: string[];
}

export type DeckCard = Quizit | Explanation;

export type Deck = DeckCard[];
