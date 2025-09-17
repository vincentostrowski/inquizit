import { useState, useEffect, useCallback } from 'react';
import { booksService } from '../services/booksService';

// Mock books data for skeleton loading
const MOCK_BOOKS = [
  {
    id: -1,
    title: 'Loading...',
    cover: '',
    collection: 0,
    header_color: '',
    background_end_color: '',
    button_text_border_color: '',
    button_circle_color: '',
    isMock: true
  },
  {
    id: -2,
    title: 'Loading...',
    cover: '',
    collection: 0,
    header_color: '',
    background_end_color: '',
    button_text_border_color: '',
    button_circle_color: '',
    isMock: true
  },
  {
    id: -3,
    title: 'Loading...',
    cover: '',
    collection: 0,
    header_color: '',
    background_end_color: '',
    button_text_border_color: '',
    button_circle_color: '',
    isMock: true
  }
];

export const useBooks = (collectionId) => {
  const [books, setBooks] = useState(MOCK_BOOKS);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  /**
   * Load initial books for the collection
   */
  const loadInitialBooks = useCallback(async () => {
    if (!collectionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError, hasMore: hasMoreData } = await booksService.fetchInitialBooks(collectionId);
      
      if (fetchError) {
        setError(fetchError.message || 'Failed to load books');
        return;
      }
      
      setBooks(data || []);
      setHasMore(hasMoreData);
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error loading initial books:', err);
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  /**
   * Load more books (for infinite scroll)
   */
  const loadMoreBooks = useCallback(async () => {
    if (!collectionId || loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    
    try {
      const { data, error: fetchError, hasMore: hasMoreData } = await booksService.fetchMoreBooks(collectionId, books.length);
      
      if (fetchError) {
        setError(fetchError.message || 'Failed to load more books');
        return;
      }
      
      // Filter out any duplicates by ID before adding to state
      setBooks(prev => {
        const existingIds = new Set(prev.map(book => book.id));
        const newBooks = (data || []).filter(book => !existingIds.has(book.id));
        return [...prev, ...newBooks];
      });
      setHasMore(hasMoreData);
    } catch (err) {
      setError('An unexpected error occurred while loading more books');
      console.error('Error loading more books:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [collectionId, books.length, loadingMore, hasMore]);

  // Load initial books when collectionId changes
  useEffect(() => {
    if (collectionId) {
      setBooks([]);
      setHasMore(true);
      loadInitialBooks();
    }
  }, [collectionId, loadInitialBooks]);

  return {
    books,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMoreBooks
  };
};
