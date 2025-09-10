import React, { createContext, useContext, useState, ReactNode } from 'react';
import { router } from 'expo-router';
import { normalizeId, compareIds, includesId } from '../utils/idUtils';

interface BookSelection {
  bookId: string;
  bookTitle: string;
  bookCover: string;
  selectedCardIds: string[];
  headerColor?: string;
  backgroundEndColor?: string;
  buttonTextBorderColor?: string;
  buttonCircleColor?: string;
}

interface QuizitConfigData {
  screenType: 'book' | 'section' | 'card';
  bookCover: string;
  title: string;
  isEditMode: boolean;
  bookSelections: BookSelection[];
  onStartQuizit: () => void;
  currentBookId?: string; // Add current book ID for comparison
}

interface QuizitConfigContextType {
  showModal: boolean;
  modalData: QuizitConfigData | null;
  showQuizitConfig: (data: QuizitConfigData) => void;
  hideQuizitConfig: () => void;
  toggleEditMode: () => void;
  addCardToSelection: (bookId: string, bookTitle: string, bookCover: string, cardId: string, colors?: { headerColor?: string; backgroundEndColor?: string; buttonTextBorderColor?: string; buttonCircleColor?: string }) => void;
  removeCardFromSelection: (bookId: string, cardId: string) => void;
  toggleCardSelection: (bookId: string, bookTitle: string, bookCover: string, cardId: string, colors?: { headerColor?: string; backgroundEndColor?: string; buttonTextBorderColor?: string; buttonCircleColor?: string }) => void;
  clearAllSelections: () => void;
  getTotalCardCount: () => number;
  isCardSelected: (bookId: string, cardId: string) => boolean;
  navigateToBookEdit: (book: BookSelection) => void;
}

const QuizitConfigContext = createContext<QuizitConfigContextType | undefined>(undefined);

export const useQuizitConfig = () => {
  const context = useContext(QuizitConfigContext);
  if (!context) {
    throw new Error('useQuizitConfig must be used within a QuizitConfigProvider');
  }
  return context;
};

interface QuizitConfigProviderProps {
  children: ReactNode;
}

export const QuizitConfigProvider = ({ children }: QuizitConfigProviderProps) => {
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<QuizitConfigData | null>(null);

  const showQuizitConfig = (data: QuizitConfigData) => {
    setModalData(data);
    setShowModal(true);
  };

  const hideQuizitConfig = () => {
    setShowModal(false);
    setModalData(null);
  };

  const toggleEditMode = () => {
    setModalData(prev => prev ? { ...prev, isEditMode: !prev.isEditMode } : null);
  };

  const addCardToSelection = (bookId: string, bookTitle: string, bookCover: string, cardId: string, colors?: { headerColor?: string; backgroundEndColor?: string; buttonTextBorderColor?: string; buttonCircleColor?: string }) => {
    setModalData(prev => {
      if (!prev) return null;
      
      const normalizedBookId = normalizeId(bookId);
      const normalizedCardId = normalizeId(cardId);
      
      const existingBook = prev.bookSelections.find(book => compareIds(book.bookId, normalizedBookId));
      
      if (existingBook) {
        const cardExists = includesId(existingBook.selectedCardIds, normalizedCardId);
        if (!cardExists) {
          return {
            ...prev,
            bookSelections: prev.bookSelections.map(book => 
              compareIds(book.bookId, normalizedBookId)
                ? { ...book, selectedCardIds: [...book.selectedCardIds, normalizedCardId] }
                : book
            )
          };
        }
        return prev;
      } else {
        return {
          ...prev,
          bookSelections: [...prev.bookSelections, { 
            bookId: normalizedBookId, 
            bookTitle, 
            bookCover, 
            selectedCardIds: [normalizedCardId],
            headerColor: colors?.headerColor || 'green',
            backgroundEndColor: colors?.backgroundEndColor || 'green',
            buttonTextBorderColor: colors?.buttonTextBorderColor || 'green',
            buttonCircleColor: colors?.buttonCircleColor || 'green'
          }]
        };
      }
    });
  };

  const removeCardFromSelection = (bookId: string, cardId: string) => {
    setModalData(prev => {
      if (!prev) return null;
      
      const normalizedBookId = normalizeId(bookId);
      const normalizedCardId = normalizeId(cardId);
      
      return {
        ...prev,
        bookSelections: prev.bookSelections.map(book => 
          compareIds(book.bookId, normalizedBookId)
            ? { ...book, selectedCardIds: book.selectedCardIds.filter(id => !compareIds(id, normalizedCardId)) }
            : book
        ).filter(book => book.selectedCardIds.length > 0)
      };
    });
  };

  const toggleCardSelection = (bookId: string, bookTitle: string, bookCover: string, cardId: string, colors?: { headerColor?: string; backgroundEndColor?: string; buttonTextBorderColor?: string; buttonCircleColor?: string }) => {
    const isSelected = isCardSelected(bookId, cardId);
    
    if (isSelected) {
      removeCardFromSelection(bookId, cardId);
    } else {
      addCardToSelection(bookId, bookTitle, bookCover, cardId, colors);
    }
  };

  const clearAllSelections = () => {
    setModalData(prev => prev ? { ...prev, bookSelections: [] } : null);
  };

  const getTotalCardCount = () => {
    return modalData?.bookSelections.reduce((total, book) => total + book.selectedCardIds.length, 0) || 0;
  };

  const isCardSelected = (bookId: string, cardId: string) => {
    const normalizedBookId = normalizeId(bookId);
    const normalizedCardId = normalizeId(cardId);
    const book = modalData?.bookSelections.find(b => compareIds(b.bookId, normalizedBookId));
    return book ? includesId(book.selectedCardIds, normalizedCardId) : false;
  };

  const navigateToBookEdit = (book: BookSelection) => {
    // Check if we're already on the same book
    const currentBookId = modalData?.currentBookId;
    const isSameBook = currentBookId && compareIds(currentBookId, book.bookId);
    
    if (isSameBook) {
      // If we're already on the same book, just switch to edit mode
      if (modalData) {
        setModalData({
          ...modalData,
          isEditMode: true
        });
      }
    } else {
      // Switch to edit mode first
      if (modalData) {
        setModalData({
          ...modalData,
          isEditMode: true
        });
      }
      
      // Navigate to the book page with all necessary data
      router.push({
        pathname: '/library/book',
        params: {
          bookId: book.bookId,
          bookTitle: book.bookTitle,
          bookCover: book.bookCover,
          headerColor: book.headerColor || 'green',
          backgroundEndColor: book.backgroundEndColor || 'green',
          buttonTextBorderColor: book.buttonTextBorderColor || 'green',
          buttonCircleColor: book.buttonCircleColor || 'green'
        }
      });
    }
  };

  return (
    <QuizitConfigContext.Provider
      value={{
        showModal,
        modalData,
        showQuizitConfig,
        hideQuizitConfig,
        toggleEditMode,
        addCardToSelection,
        removeCardFromSelection,
        toggleCardSelection,
        clearAllSelections,
        getTotalCardCount,
        isCardSelected,
        navigateToBookEdit,
      }}
    >
      {children}
    </QuizitConfigContext.Provider>
  );
};
