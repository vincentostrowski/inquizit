import { useState, useEffect, useCallback } from 'react';
import { savedItemsService } from '../services/savedItemsService';
import { useAuth } from '../context/AuthContext';

const BOOKS_PER_PAGE = 12;

export const useSavedBooks = () => {
  const [savedBooks, setSavedBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  /**
   * Load initial saved books
   */
  const loadInitialSavedBooks = useCallback(async () => {
    if (!user?.id) {
      setSavedBooks([]);
      setHasMore(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError, hasMore: hasMoreData } = await savedItemsService.getSavedBooks(
        user.id,
        0,
        BOOKS_PER_PAGE
      );
      
      if (fetchError) {
        setError(fetchError.message || 'Failed to load saved books');
        return;
      }
      
      setSavedBooks(data || []);
      setHasMore(hasMoreData);
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error loading initial saved books:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Load more saved books (for infinite scroll)
   */
  const loadMoreSavedBooks = useCallback(async () => {
    if (!user?.id || loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    
    try {
      const { data, error: fetchError, hasMore: hasMoreData } = await savedItemsService.getSavedBooks(
        user.id,
        savedBooks.length,
        BOOKS_PER_PAGE
      );
      
      if (fetchError) {
        setError(fetchError.message || 'Failed to load more saved books');
        return;
      }
      
      // Filter out any duplicates by ID before adding to state
      setSavedBooks(prev => {
        const existingIds = new Set(prev.map(book => book.id));
        const newBooks = (data || []).filter(book => !existingIds.has(book.id));
        return [...prev, ...newBooks];
      });
      setHasMore(hasMoreData);
    } catch (err) {
      setError('An unexpected error occurred while loading more saved books');
      console.error('Error loading more saved books:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [user?.id, savedBooks.length, loadingMore, hasMore]);

  /**
   * Refresh saved books (reload from beginning)
   */
  const refreshSavedBooks = useCallback(async () => {
    setSavedBooks([]);
    setHasMore(true);
    await loadInitialSavedBooks();
  }, [loadInitialSavedBooks]);

  // Load initial saved books when user changes
  useEffect(() => {
    if (user?.id) {
      loadInitialSavedBooks();
    } else {
      // Clear saved books if user logs out
      setSavedBooks([]);
      setHasMore(false);
    }
  }, [user?.id, loadInitialSavedBooks]);

  return {
    savedBooks,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMoreSavedBooks,
    refreshSavedBooks
  };
};

