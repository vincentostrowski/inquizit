import { supabase } from './supabaseClient';

const BOOKS_PER_PAGE = 10;

export const booksService = {
  /**
   * Fetch books for a specific collection with pagination
   * @param {number} collectionId - ID of the collection
   * @param {number} offset - Starting index for pagination
   * @param {number} limit - Number of books to fetch
   * @returns {Promise<{data: Array, error: any}>}
   */
  async fetchBooks(collectionId, offset = 0, limit = BOOKS_PER_PAGE) {
    try {
      let query = supabase
        .from('books')
        .select(`
          id,
          title,
          cover,
          collection,
          header_color,
          background_end_color,
          button_text_border_color,
          button_circle_color
        `)
        .range(offset, offset + limit - 1);

      // Filter by collection if provided
      if (collectionId) {
        query = query.eq('collection', collectionId);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching books:', error);
        return { data: null, error };
      }

      return { 
        data: data || [], 
        error: null, 
        hasMore: data ? data.length === limit : false,
        totalCount: count || 0
      };
    } catch (error) {
      console.error('Unexpected error fetching books:', error);
      return { data: null, error };
    }
  },

  /**
   * Fetch initial books for a collection
   * @param {number} collectionId - ID of the collection
   * @returns {Promise<{data: Array, error: any}>}
   */
  async fetchInitialBooks(collectionId) {
    return this.fetchBooks(collectionId, 0, BOOKS_PER_PAGE);
  },

  /**
   * Fetch more books for a collection (for pagination)
   * @param {number} collectionId - ID of the collection
   * @param {number} currentCount - Current number of loaded books
   * @returns {Promise<{data: Array, error: any}>}
   */
  async fetchMoreBooks(collectionId, currentCount) {
    return this.fetchBooks(collectionId, currentCount, BOOKS_PER_PAGE);
  }
};
