import { useState, useEffect, useCallback } from 'react';
import { bookDetailsService } from '../services/bookDetailsService';
import { useAuth } from '../context/AuthContext';

export const useBookDetails = (bookId) => {
  const [bookDetails, setBookDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchBookDetails = useCallback(async () => {
    if (!bookId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Pass userId to fetchBookDetails for saved status
      const userId = user?.id || null;
      const { data, error } = await bookDetailsService.fetchBookDetails(bookId, userId);
      
      if (error) {
        setError(error.message || 'Failed to fetch book details');
        return;
      }
      
      setBookDetails(data);
    } catch (err) {
      setError('An unexpected error occurred while fetching book details');
      console.error('Error fetching book details:', err);
    } finally {
      setLoading(false);
    }
  }, [bookId, user?.id]);

  useEffect(() => {
    fetchBookDetails();
  }, [fetchBookDetails]);

  /**
   * Update book saved status without re-fetching
   */
  const updateBookSavedStatus = useCallback((isSaved) => {
    setBookDetails(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        book: {
          ...prev.book,
          isSaved,
        },
      };
    });
  }, []);

  /**
   * Update card saved status without re-fetching
   */
  const updateCardSavedStatus = useCallback((cardId, isSaved) => {
    setBookDetails(prev => {
      if (!prev || !prev.sections) return prev;
      return {
        ...prev,
        sections: prev.sections.map(section => ({
          ...section,
          cards: section.cards.map(card => 
            card.id === cardId ? { ...card, isSaved } : card
          ),
        })),
      };
    });
  }, []);

  /**
   * Update all cards saved status (for unsaving book with cards)
   */
  const updateAllCardsSavedStatus = useCallback((isSaved) => {
    setBookDetails(prev => {
      if (!prev || !prev.sections) return prev;
      return {
        ...prev,
        sections: prev.sections.map(section => ({
          ...section,
          cards: section.cards.map(card => ({ ...card, isSaved: false })),
        })),
      };
    });
  }, []);

  return {
    bookDetails,
    loading,
    error,
    updateBookSavedStatus,
    updateCardSavedStatus,
    updateAllCardsSavedStatus,
  };
};
