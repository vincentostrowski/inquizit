import { useState, useCallback, useRef } from 'react';
import { searchService } from '../services/searchService';

export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchLoadingMore, setSearchLoadingMore] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [hasMoreResults, setHasMoreResults] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  
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
      const { data, error, hasMore } = await searchService.searchInitialBooks(query);
      
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
  }, []);

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
      const { data, error, hasMore } = await searchService.searchMoreBooks(searchQuery, searchResults.length);
      
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
  }, [searchQuery, searchResults.length, searchLoadingMore, hasMoreResults]);

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
