// Shared types for Quizit system

export interface QuizitItem {
  faceType: 'concept' | 'quizit' | 'blank';
  conceptData?: {
    id: string;
    banner: string;
    title: string;
    description: string;
    reasoning: string;
    status?: 'question' | 'empty' | 'checkmark';
    recognitionScore?: number;
    reasoningScore?: number;
  };
  quizitData?: {
    quizit: string;
    quizitId: string;
  };
}

export type QuizitItems = QuizitItem[];

export interface CardData {
  cardId: string;
  cardIdea: string;
  wordsToAvoid: string;
  quizitComponentStructure: any;
  quizitValidPermutations: any;
  banner: string;
  title: string;
  description: string;
}

export interface QuizitData {
  quizitId: string;
  cardId1: string;
  cardId2?: string;
  scenario: string;
  reasoning: string;
  permutationIndex: number;
  seedBundleIndex: number;
}

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature: number;
  max_tokens: number;
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}
