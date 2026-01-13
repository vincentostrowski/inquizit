import { useState, useCallback, useRef, useEffect } from 'react';
import { searchService } from '../services/searchService';
import { useAuth } from '../context/AuthContext';

export const useSearch = (savedOnly = false) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchLoadingMore, setSearchLoadingMore] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [hasMoreResults, setHasMoreResults] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useAuth();
  
  const debounceTimeoutRef = useRef(null);

  /**
   * Perform search with debouncing
   */
  const performSearch = useCallback(async (query) => {
    if (!query || query.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      setHasMoreResults(true);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    setIsSearching(true);
    
    try {
      const userId = user?.id || null;
      const { data, error, hasMore } = await searchService.searchInitialBooks(query, userId, savedOnly);
      
      if (error) {
        setSearchError(error.message || 'Failed to search books');
        return;
      }
      
      setSearchResults(data || []);
      setHasMoreResults(hasMore);
    } catch (err) {
      setSearchError('An unexpected error occurred during search');
      console.error('Error performing search:', err);
    } finally {
      setSearchLoading(false);
    }
  }, [savedOnly, user?.id]);

  /**
   * Debounced search function
   */
  const search = useCallback((query) => {
    setSearchQuery(query);
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300); // 300ms debounce
  }, [performSearch]);

  /**
   * Load more search results
   */
  const loadMoreResults = useCallback(async () => {
    if (!searchQuery || searchLoadingMore || !hasMoreResults) return;
    
    setSearchLoadingMore(true);
    
    try {
      const userId = user?.id || null;
      const { data, error, hasMore } = await searchService.searchMoreBooks(searchQuery, searchResults.length, userId, savedOnly);
      
      if (error) {
        setSearchError(error.message || 'Failed to load more results');
        return;
      }
      
      // Filter out any duplicates by ID before adding to state
      setSearchResults(prev => {
        const existingIds = new Set(prev.map(book => book.id));
        const newResults = (data || []).filter(book => !existingIds.has(book.id));
        return [...prev, ...newResults];
      });
      setHasMoreResults(hasMore);
    } catch (err) {
      setSearchError('An unexpected error occurred while loading more results');
      console.error('Error loading more search results:', err);
    } finally {
      setSearchLoadingMore(false);
    }
  }, [searchQuery, savedOnly, searchResults.length, searchLoadingMore, hasMoreResults, user?.id]);

  /**
   * Clear search
   */
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    setSearchError(null);
    setHasMoreResults(true);
    
    // Clear any pending debounced search
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, []);

  // Re-run search when savedOnly changes (if there's an active search query)
  useEffect(() => {
    if (searchQuery && searchQuery.trim().length > 0) {
      // Clear any pending debounced search
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      // Re-run search immediately with new savedOnly value
      performSearch(searchQuery);
    }
    // Only depend on savedOnly - we don't want to re-run when searchQuery changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedOnly]);

  return {
    searchQuery,
    searchResults,
    searchLoading,
    searchLoadingMore,
    searchError,
    hasMoreResults,
    isSearching,
    search,
    loadMoreResults,
    clearSearch
  };
};
