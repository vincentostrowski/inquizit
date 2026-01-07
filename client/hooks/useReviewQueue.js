import { useState, useEffect, useCallback } from 'react';
import { spacedRepetitionService } from '../services/spacedRepetitionService';

/**
 * Hook to fetch and manage review queue cards
 * Returns all cards in the review system (due IS NOT NULL)
 */
export const useReviewQueue = (userId) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadReviewQueue = useCallback(async () => {
    if (!userId) {
      setCards([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch all review queue cards (no limit for now, can add pagination later)
      const { data, error: fetchError } = await spacedRepetitionService.getReviewQueue(
        userId,
        null, // No limit - fetch all
        0
      );

      if (fetchError) {
        setError(fetchError.message || 'Failed to load review queue');
        return;
      }

      setCards(data || []);
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error loading review queue:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refreshReviewQueue = useCallback(async () => {
    await loadReviewQueue();
  }, [loadReviewQueue]);

  useEffect(() => {
    if (userId) {
      loadReviewQueue();
    } else {
      setCards([]);
    }
  }, [userId, loadReviewQueue]);

  return {
    cards,
    loading,
    error,
    refreshReviewQueue,
  };
};

