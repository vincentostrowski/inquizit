import { supabase } from './supabaseClient';

const SEARCH_RESULTS_PER_PAGE = 12;

export const searchService = {
  /**
   * Search books by title with pagination
   * @param {string} query - Search query
   * @param {number} offset - Starting index for pagination
   * @param {number} limit - Number of results to fetch
   * @returns {Promise<{data: Array, error: any}>}
   */
  async searchBooks(query, offset = 0, limit = SEARCH_RESULTS_PER_PAGE) {
    try {
      if (!query || query.trim().length === 0) {
        return { data: [], error: null, hasMore: false, totalCount: 0 };
      }

      const { data, error, count } = await supabase
        .from('books')
        .select(`
          id,
          title,
          cover,
          collection,
          header_color,
          background_end_color,
          button_text_border_color,
          button_circle_color,
          created_at,
          collections!inner(
            id,
            title
          )
        `)
        .ilike('title', `%${query.trim()}%`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error searching books:', error);
        return { data: null, error };
      }

      // Transform the data to include collection info
      const transformedData = (data || []).map(book => ({
        ...book,
        collection_title: book.collections?.title || 'Unknown Collection',
        collection_id: book.collections?.id || book.collection
      }));

      return { 
        data: transformedData, 
        error: null, 
        hasMore: data ? data.length === limit : false,
        totalCount: count || 0
      };
    } catch (error) {
      console.error('Unexpected error searching books:', error);
      return { data: null, error };
    }
  },

  /**
   * Search books with initial load
   * @param {string} query - Search query
   * @returns {Promise<{data: Array, error: any}>}
   */
  async searchInitialBooks(query) {
    return this.searchBooks(query, 0, SEARCH_RESULTS_PER_PAGE);
  },

  /**
   * Search more books (for pagination)
   * @param {string} query - Search query
   * @param {number} currentCount - Current number of loaded results
   * @returns {Promise<{data: Array, error: any}>}
   */
  async searchMoreBooks(query, currentCount) {
    return this.searchBooks(query, currentCount, SEARCH_RESULTS_PER_PAGE);
  }
};
