import { useState, useEffect, useCallback } from 'react';
import { bookDetailsService } from '../services/bookDetailsService';

export const useBookDetails = (bookId) => {
  const [bookDetails, setBookDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookDetails = useCallback(async () => {
    if (!bookId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await bookDetailsService.fetchBookDetails(bookId);
      
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
  }, [bookId]);

  useEffect(() => {
    fetchBookDetails();
  }, [fetchBookDetails]);

  const refresh = useCallback(() => {
    fetchBookDetails();
  }, [fetchBookDetails]);

  return {
    bookDetails,
    loading,
    error,
    refresh
  };
};
