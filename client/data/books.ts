import { generateId } from './utils';
import type { Book } from './types';

// Mock Books
export const books: Book[] = [
  {
    _id: generateId(),
    title: "How to Win Friends and Influence People",
    author: "Dale Carnegie",
    description: "Dale Carnegie's rock-solid, time-tested advice has carried countless people up the ladder of success in their business and personal lives.",
    coverUrl: "https://m.media-amazon.com/images/I/51PWIy1rHUL._SL500_.jpg"
  },
  {
    _id: generateId(),
    title: "Originals",
    author: "Adam Grant",
    description: "Using surprising studies and stories spanning business, politics, sports, and entertainment, Grant explores how to recognize a good idea, speak up without getting silenced, build a coalition of allies, choose the right time to act, and manage fear and doubt.",
    coverUrl: "https://m.media-amazon.com/images/I/71QCH3j31wL.jpg"
  },
  {
    _id: generateId(),
    title: "The Stuff of Thought",
    author: "Steven Pinker",
    description: "The Stuff of Thought explores how the mind works by examining how we use words. Pinker shows us how the mind represents ideas, how language represents those representations, and what this reveals about ourselves.",
    coverUrl: "https://m.media-amazon.com/images/I/81AoKswQ8ML.jpg"
  },
  {
    _id: generateId(),
    title: "A Short History of Nearly Everything",
    author: "Bill Bryson",
    description: "Taking as territory everything from the Big Bang to the rise of civilization, Bryson seeks to understand how we got from there being nothing at all to there being us.",
    coverUrl: "https://m.media-amazon.com/images/I/71yt6mN5HuL.jpg"
  },
  {
    _id: generateId(),
    title: "Guns, Germs, and Steel",
    author: "Jared Diamond",
    description: "In this artful, informative, and delightful book, Jared Diamond convincingly argues that geographical and environmental factors shaped the modern world.",
    coverUrl: "https://m.media-amazon.com/images/I/61V8g4GgqdL._AC_UF1000,1000_QL80_.jpg"
  },
  {
    _id: generateId(),
    title: "Philosophy: The Classics",
    author: "Nigel Warburton",
    description: "Now in its fourth edition, Philosophy: The Classics is a comprehensive introduction to the history of Western philosophy, from the Ancient Greeks to modern thinkers.",
    coverUrl: "https://m.media-amazon.com/images/I/612Wqo+IhPL.jpg"
  },
  {
    _id: generateId(),
    title: "Philosophy: The Basics",
    author: "Nigel Warburton",
    description: "A clear and engaging introduction to philosophy, covering key topics like knowledge, reality, truth, ethics, and religious beliefs.",
    coverUrl: "https://m.media-amazon.com/images/I/61K+N8k1YnL.jpg"
  },
  {
    _id: generateId(),
    title: "Manufacturing Consent",
    author: "Noam Chomsky & Edward S. Herman",
    description: "An analysis of the ways in which the mass media of the United States serve as a system for communicating messages and symbols to the general populace.",
    coverUrl: "https://m.media-amazon.com/images/I/71Xnit90WIL.jpg"
  }, 
  {
    _id: generateId(),
    title: "The Art of War",
    author: "Sun Tzu",
    description: "The Art of War is an ancient Chinese military treatise attributed to Sun Tzu, a military strategist, and philosopher.",
    coverUrl: "https://m.media-amazon.com/images/I/71MizulW5AL.jpg"
  }, 
  {
    _id: generateId(),
    title: "Zero to One", 
    author: "Peter Thiel",
    description: "Zero to One presents at once an optimistic view of the future of progress in America and a new way of thinking about innovation: it starts by learning to ask the questions that lead you to find value in unexpected places.",
    coverUrl: "https://m.media-amazon.com/images/I/51zGCdRQXOL.jpg"
  }, 
  {
    _id: generateId(),
    title: "Thinking Fast and Slow",
    author: "Daniel Kahneman",
    description: "In Thinking, Fast and Slow, Kahneman takes us on a groundbreaking tour of the mind and explains the two systems that drive the way we think.",
    coverUrl: "https://m.media-amazon.com/images/I/61fdrEuPJwL._AC_UF1000,1000_QL80_.jpg"
  }
];

// Helper functions to mimic MongoDB queries
export const getBookById = (id: string) => books.find(book => book._id === id);
