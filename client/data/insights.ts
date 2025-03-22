import { generateId } from './utils';
import { books } from './books';
import type { Insight } from './types';

// Mock Insights
const createInsights = () => {
  
  const A1: Insight = {
    _id: generateId(),
    title: "Techniques in Handling People ",
    body: [
      "Human nature does not like to admit fault. When people are criticized or humiliated, they rarely respond well and will often become defensive.",
      "Criticism is futile because it puts a person on the defensive and usually makes them strive to justify themselves.",
      "Instead of condemning people, try to understand them. Try to figure out why they do what they do."
    ],
    parentId: books[0]._id,
    parentType: 'book',
    bookId: books[0]._id,
    order: 1,
    prompt: "How does criticism affect human behavior according to Carnegie?"
  };

  const A2: Insight = {
    _id: generateId(),
    title: "Make People Like You",
    body: [
      "There is one all-important law of human conduct: Always make the other person feel important.",
      "The difference between appreciation and flattery? One is sincere and the other insincere.",
      "Be \"hearty in your approbation and lavish in your praise,\" but make sure it's genuine."
    ],
    parentId: books[0]._id,
    parentType: 'book',
    bookId: books[0]._id,
    order: 2,
    prompt: "What's the key difference between appreciation and flattery?"
  };

  const A3: Insight = {
    _id: generateId(),
    title: "Win People To Your Way of Thinking",
    body: [
      "People like to feel important. They like to feel that they are needed.",
      "Arouse in the other person an eager want.",
    ],
    parentId: books[0]._id,
    parentType: 'book',
    bookId: books[0]._id,
    order: 3,
    prompt: "How can you make people feel important?"
  };

  const A4: Insight = {
    _id: generateId(),
    title: "Being a Leader",
    body: [
      "People like to feel important. They like to feel that they are needed.",
      "Arouse in the other person an eager want.",
    ],
    parentId: books[0]._id,
    parentType: 'book',
    bookId: books[0]._id,
    order: 4,
    prompt: "How can you make people feel important?"
  };  

  const A11: Insight = {
    _id: generateId(),
    title: "Don’t criticize, condemn or complain",
    body: [
      "Specific compliments about someone's work or contribution",
      "Acknowledging effort and progress, not just results",
      "Taking time to understand and recognize unique qualities"
    ],
    parentId: A1._id,
    parentType: 'insight',
    bookId: books[0]._id,
    order: 1,
    prompt: "What makes appreciation feel genuine?"
  };

  const A12: Insight = {
    _id: generateId(),
    title: "Give honest sincere appreciation",
    body: [
      "Specific compliments about someone's work or contribution",
      "Acknowledging effort and progress, not just results",
    ],
    parentId: A1._id,
    parentType: 'insight',
    bookId: books[0]._id,
    order: 2,
    prompt: "What makes appreciation feel genuine?"
  };

  const A13: Insight = {
    _id: generateId(),
    title: "Arouse in the other person an eager want",
    body: [
      "People like to feel important. They like to feel that they are needed.",
      "Arouse in the other person an eager want.",
    ],
    parentId: A1._id,
    parentType: 'insight',
    bookId: books[0]._id,
    order: 3,
    prompt: "What makes appreciation feel genuine?"
  };
  
  return [A1, A2, A3, A4, A11, A12, A13];
};

export const insights = createInsights();

// Helper functions to mimic MongoDB queries
export const getInsightsByBookId = (bookId: string) => 
  insights.filter(insight => insight.bookId === bookId);

export const getInsightsByParentId = (parentId: string) =>
  insights.filter(insight => insight.parentId === parentId);

export const getRootInsights = (bookId: string) =>
  insights.filter(insight => insight.parentType === 'book' && insight.bookId === bookId)
    .sort((a, b) => a.order - b.order); 