import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { router } from 'expo-router';
import { normalizeId, compareIds, includesId } from '../utils/idUtils';
import { createQuizitSession } from '../services/quizitSessionService';

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

interface QuizitSession {
  sessionId: string;
  title: string;
  createdAt: number;
  selectedCards: BookSelection[];
}

interface QuizitConfigData {
  screenType: 'book' | 'section' | 'card';
  bookCover: string;
  title: string;
  isEditMode: boolean;
  bookSelections: BookSelection[];
  onStartQuizit: (modalData: QuizitConfigData) => void;
}

interface QuizitConfigContextType {
  showModal: boolean;
  modalData: QuizitConfigData | null;
  activeSessionId: string | null;
  sessionHistory: QuizitSession[];
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
  navigationStack: string[];
  pushToNavigationStack: (bookId: string) => void;
  popFromNavigationStack: (bookId: string) => void;
  isCurrentlyOnBook: (bookId: string) => boolean;
  navigateToLibraryEdit: () => void;
  startQuizitSession: (modalData?: QuizitConfigData) => Promise<{ sessionId: string; cardCount: number }>;
  clearSession: () => void;
  addSessionToHistory: (session: QuizitSession) => void;
  getSessionHistory: () => QuizitSession[];
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
  const [navigationStack, setNavigationStack] = useState<string[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionHistory, setSessionHistory] = useState<QuizitSession[]>([]);

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

  const pushToNavigationStack = useCallback((bookId: string) => {
    const normalizedBookId = normalizeId(bookId);
    setNavigationStack(prev => {
      // Only add if not already in stack
      if (!prev.includes(normalizedBookId)) {
        return [...prev, normalizedBookId];
      }
      return prev;
    });
  }, []);

  const popFromNavigationStack = useCallback((bookId: string) => {
    const normalizedBookId = normalizeId(bookId);
    setNavigationStack(prev => prev.filter(id => id !== normalizedBookId));
  }, []);

  const isCurrentlyOnBook = useCallback((bookId: string) => {
    const normalizedBookId = normalizeId(bookId);
    return navigationStack.length > 0 && 
           navigationStack[navigationStack.length - 1] === normalizedBookId;
  }, [navigationStack]);


  const navigateToBookEdit = useCallback((book: BookSelection) => {
    // Check if we're already on this book
    if (isCurrentlyOnBook(book.bookId)) {
      // Just switch to edit mode, no navigation needed
      if (modalData) {
        setModalData({
          ...modalData,
          isEditMode: true
        });
      }
    } else {
      // Switch to edit mode and navigate to the book page
      if (modalData) {
        setModalData({
          ...modalData,
          isEditMode: true
        });
      }
      
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
  }, [isCurrentlyOnBook, modalData]);

  const navigateToLibraryEdit = useCallback(() => {
    // Switch to edit mode and navigate to library
    if (modalData) {
      setModalData({
        ...modalData,
        isEditMode: true
      });
    }
    
    router.push('/library');
  }, [modalData]);

  const addSessionToHistory = useCallback((session: QuizitSession) => {
    setSessionHistory(prev => {
      // Remove existing session with same ID if it exists
      const filtered = prev.filter(s => s.sessionId !== session.sessionId);
      
      // Add new session to the beginning
      const updated = [session, ...filtered];
      
      // Keep only the 5 most recent sessions
      return updated.slice(0, 5);
    });
  }, []);


  const getSessionHistory = useCallback(() => {
    return sessionHistory;
  }, [sessionHistory]);

  const startQuizitSession = useCallback(async (passedModalData?: QuizitConfigData) => {
    const dataToUse = passedModalData || modalData;
    
    if (!dataToUse) {
      throw new Error('No modal data available');
    }

    // Get ALL selected card IDs from the modal state
    const allSelectedCardIds = dataToUse.bookSelections.flatMap(book => book.selectedCardIds);
    
    if (allSelectedCardIds.length === 0) {
      throw new Error('No cards selected');
    }

    try {
      const sessionData = await createQuizitSession(allSelectedCardIds);
      setActiveSessionId(sessionData.sessionId);
      
      // Add session to history
      const sessionTitle = dataToUse.title || 'Quizit Session';
      const newSession: QuizitSession = {
        sessionId: sessionData.sessionId,
        title: sessionTitle,
        createdAt: Date.now(),
        selectedCards: dataToUse.bookSelections
      };
      addSessionToHistory(newSession);
      
      return sessionData;
    } catch (error) {
      console.error('Failed to create quizit session:', error);
      throw error;
    }
  }, [modalData, addSessionToHistory]);

  const clearSession = useCallback(() => {
    setActiveSessionId(null);
  }, []);

  return (
    <QuizitConfigContext.Provider
      value={{
        showModal,
        modalData,
        activeSessionId,
        sessionHistory,
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
        navigationStack,
        pushToNavigationStack,
        popFromNavigationStack,
        isCurrentlyOnBook,
        navigateToLibraryEdit,
        startQuizitSession,
        clearSession,
        addSessionToHistory,
        getSessionHistory,
      }}
    >
      {children}
    </QuizitConfigContext.Provider>
  );
};
