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
  bookId: string;    // Direct reference to book for easier querying
  order: number;     // For ordering within same parent
  prompt?: string;   // Optional prompt
} 