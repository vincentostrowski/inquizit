// BookContext.js
import { createContext, useContext, useState } from 'react';

const BookContext = createContext();

export const BookProvider = ({ children }) => {
  const [selectedBook, setSelectedBook] = useState(null);
  const [insightTree, setInsightTree] = useState([]);
  const [insightMap, setInsightMap] = useState({});

  // Custom function to update selectedBook
  const updateSelectedBook = (book) => {
    if (!selectedBook || book.id != selectedBook.id) {
      setInsightTree([]);
      setInsightMap({});
      setSelectedBook(book);
    };
  };

  return (
    <BookContext.Provider 
      value={{ 
          selectedBook, 
          setSelectedBook: updateSelectedBook, 
          insightTree, 
          setInsightTree,
          insightMap,
          setInsightMap
      }}>
      {children}
    </BookContext.Provider>
  );
};

export const useBook = () => useContext(BookContext);
