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
  
  // Card Selections
  selectedCards: BookSelection[];
  
  // Quizit Configuration
  isPairedMode: boolean;
  biasText?: string;
}

interface QuizitConfigData {
  // Core Data
  bookSelections: BookSelection[];
  
  // Display Info
  title: string;
  
  // Quizit Configuration
  isPairedMode: boolean;
  biasText?: string;
  
  // UI State
  isEditMode: boolean;
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
  setIsPairedMode: (isPairedMode: boolean) => void;
  setBiasText: (biasText: string | undefined) => void;
  startQuizitSession: () => Promise<{ sessionId: string; cardCount: number }>;
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
    setNavigationStack(prev => [...prev, normalizedBookId]);
  }, []);

  const popFromNavigationStack = useCallback((bookId: string) => {
    const normalizedBookId = normalizeId(bookId);
    setNavigationStack(prev => {
      const lastIndex = prev.lastIndexOf(normalizedBookId);
      if (lastIndex !== -1) {
        return prev.filter((_, index) => index !== lastIndex);
      }
      return prev;
    });
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
    // Switch to edit mode
    if (modalData) {
      setModalData({
        ...modalData,
        isEditMode: true
      });
    }
    
    // Check if library exists in stack
    if (navigationStack.includes('library')) {
      // Calculate how many steps back to reach library
      const libraryIndex = navigationStack.lastIndexOf('library');
      const currentIndex = navigationStack.length - 1;
      const stepsBack = currentIndex - libraryIndex;
      
      // Navigate back the calculated number of steps
      for (let i = 0; i < stepsBack; i++) {
        router.back();
      }
    } else {
      // Library doesn't exist (root) → create new library
      router.push('/library');
    }
  }, [modalData, navigationStack]);

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

  const setIsPairedMode = useCallback((isPairedMode: boolean) => {
    setModalData(prev => prev ? { ...prev, isPairedMode } : null);
  }, []);

  const setBiasText = useCallback((biasText: string | undefined) => {
    setModalData(prev => prev ? { ...prev, biasText } : null);
  }, []);

  const startQuizitSession = useCallback(async () => {
    if (!modalData) {
      throw new Error('No modal data available');
    }

    // Create unified config object
    const config = {
      selectedCardIds: modalData.bookSelections.flatMap(book => book.selectedCardIds),
      isPairedMode: modalData.isPairedMode,
      biasText: modalData.biasText || ''
    };
    
    if (config.selectedCardIds.length === 0) {
      throw new Error('No cards selected');
    }

    try {
      const sessionData = await createQuizitSession(config);
      setActiveSessionId(sessionData.sessionId);
      
      // Add session to history with complete configuration
      const newSession: QuizitSession = {
        sessionId: sessionData.sessionId,
        title: modalData.title || 'Quizit Session',
        createdAt: Date.now(),
        selectedCards: modalData.bookSelections,
        isPairedMode: modalData.isPairedMode,
        biasText: modalData.biasText
      };
      addSessionToHistory(newSession);
      
      // Navigate to quizit screen with session data
      router.push({
        pathname: '/quizit',
        params: { 
          sessionId: sessionData.sessionId,
          sessionTitle: modalData.title || 'Quizit Session'
        }
      });
      
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
        setIsPairedMode,
        setBiasText,
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
