export type Book = {
  id: string;
  title: string;
  coverUrl: string;
}

export const books: Book[] = [
  { 
    id: '1', 
    title: 'How to Win Friends and Influence People',
    coverUrl: 'https://m.media-amazon.com/images/I/51PWIy1rHUL._SL500_.jpg'  // Using placeholder images for now
  },
  { 
    id: '2', 
    title: 'Originals',
    coverUrl: 'https://m.media-amazon.com/images/I/71QCH3j31wL.jpg'
  },
  { 
    id: '3', 
    title: 'The Stuff of Thought',
    coverUrl: 'https://m.media-amazon.com/images/I/81AoKswQ8ML.jpg'
  },
  { 
    id: '4', 
    title: 'A Short History of Nearly Everything',
    coverUrl: 'https://m.media-amazon.com/images/I/71yt6mN5HuL.jpg'
  },
  { 
    id: '5', 
    title: 'Guns, Germs, and Steel',
    coverUrl: 'https://m.media-amazon.com/images/I/61V8g4GgqdL._AC_UF1000,1000_QL80_.jpg'
  },
  {
    id: '6',
    title: 'Philosphy: The Classics',
    coverUrl: 'https://m.media-amazon.com/images/I/612Wqo+IhPL.jpg'
  },
  {
    id: '7',
    title: 'Philosophy: The Basics',
    coverUrl: 'https://m.media-amazon.com/images/I/61K+N8k1YnL.jpg'
  },
  {
    id: '8',
    title: 'Manufacturing Consent',
    coverUrl: 'https://m.media-amazon.com/images/I/71Xnit90WIL.jpg'
  },
];
