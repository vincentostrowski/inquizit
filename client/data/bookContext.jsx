// BookContext.js
import { createContext, useContext, useState } from 'react';

const BookContext = createContext();

export const BookProvider = ({ children }) => {
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedBookinsights, setSelectedBookInsights] = useState([]);

  // Custom function to update selectedBook
  const updateSelectedBook = (book) => {
    if (!selectedBook || book.id != selectedBook.id) {
      setSelectedBookInsights([]);
      setSelectedBook(book);
    };
  };

  return (
    <BookContext.Provider 
      value={{ 
          selectedBook, 
          setSelectedBook: updateSelectedBook, 
          selectedBookinsights, 
          setSelectedBookInsights,
      }}>
      {children}
    </BookContext.Provider>
  );
};

export const useBook = () => useContext(BookContext);
