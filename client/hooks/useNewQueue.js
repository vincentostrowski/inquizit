import { useState, useEffect, useCallback } from 'react';
import { spacedRepetitionService } from '../services/spacedRepetitionService';

export const useNewQueue = (userId) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadNewQueue = useCallback(async () => {
    if (!userId) {
      setCards([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch all cards (no limit) by passing null/undefined for limit
      const { data, error: fetchError } = await spacedRepetitionService.getNewConceptQueue(
        userId,
        null, // No limit - fetch all cards
        0
      );

      if (fetchError) {
        setError(fetchError.message || 'Failed to load new queue');
        return;
      }

      setCards(data || []);
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error loading new queue:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refreshNewQueue = useCallback(async () => {
    await loadNewQueue();
  }, [loadNewQueue]);

  useEffect(() => {
    if (userId) {
      loadNewQueue();
    } else {
      setCards([]);
    }
  }, [userId, loadNewQueue]);

  return {
    cards,
    loading,
    error,
    refreshNewQueue,
  };
};

