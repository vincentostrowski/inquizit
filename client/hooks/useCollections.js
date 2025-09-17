import { useState, useEffect, useCallback } from 'react';
import { collectionsService } from '../services/collectionsService';

// Mock collections data for skeleton loading
const MOCK_COLLECTIONS = [
  {
    id: -1,
    title: '...',
    created_at: new Date().toISOString(),
    isMock: true
  },
  {
    id: -2, 
    title: '...',
    created_at: new Date().toISOString(),
    isMock: true
  },
  {
    id: -3,
    title: '...',
    created_at: new Date().toISOString(),
    isMock: true
  }
];

export const useCollections = () => {
  const [collections, setCollections] = useState(MOCK_COLLECTIONS);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  /**
   * Load initial collections
   */
  const loadInitialCollections = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError, hasMore: hasMoreData } = await collectionsService.fetchCollections(0, 5);
      
      if (fetchError) {
        setError(fetchError.message || 'Failed to load collections');
        return;
      }
      
      setCollections(data || []);
      setHasMore(hasMoreData);
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error loading initial collections:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load more collections (for infinite scroll)
   */
  const loadMoreCollections = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    
    try {
      const { data, error: fetchError, hasMore: hasMoreData } = await collectionsService.fetchMoreCollections(collections.length);
      
      if (fetchError) {
        setError(fetchError.message || 'Failed to load more collections');
        return;
      }
      
      // Filter out any duplicates by ID before adding to state
      setCollections(prev => {
        const existingIds = new Set(prev.map(collection => collection.id));
        const newCollections = (data || []).filter(collection => !existingIds.has(collection.id));
        return [...prev, ...newCollections];
      });
      setHasMore(hasMoreData);
    } catch (err) {
      setError('An unexpected error occurred while loading more collections');
      console.error('Error loading more collections:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [collections.length, loadingMore, hasMore]);

  // Load initial collections on mount
  useEffect(() => {
    loadInitialCollections();
  }, [loadInitialCollections]);

  return {
    collections,
    loading,
    loadingMore,
    error,
    loadMoreCollections
  };
};
