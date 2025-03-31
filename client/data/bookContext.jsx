// BookContext.js
import { createContext, useContext, useState } from 'react';

const BookContext = createContext();

export const BookProvider = ({ children }) => {
  const [selectedBook, setSelectedBook] = useState(null);
  return (
    <BookContext.Provider value={{ selectedBook, setSelectedBook }}>
      {children}
    </BookContext.Provider>
  );
};

export const useBook = () => useContext(BookContext);
