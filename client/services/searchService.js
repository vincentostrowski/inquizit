import { supabase } from './supabaseClient';

const SEARCH_RESULTS_PER_PAGE = 12;

export const searchService = {
  /**
   * Search books by title with pagination
   * @param {string} query - Search query
   * @param {number} offset - Starting index for pagination
   * @param {number} limit - Number of results to fetch
   * @param {string} userId - User ID for saved status and filtering
   * @param {boolean} savedOnly - If true, only return saved books
   * @returns {Promise<{data: Array, error: any}>}
   */
  async searchBooks(query, offset = 0, limit = SEARCH_RESULTS_PER_PAGE, userId = null, savedOnly = false) {
    try {
      if (!query || query.trim().length === 0) {
        return { data: [], error: null, hasMore: false, totalCount: 0 };
      }

      let transformedData;
      let data;
      let count;

      // If savedOnly is true, query from user_books and join with books
      if (savedOnly && userId) {
        // First, get saved book IDs for the user
        const { data: savedBooksData, error: savedBooksError } = await supabase
          .from('user_books')
          .select('book_id')
          .eq('user_id', userId);

        if (savedBooksError) {
          console.error('Error fetching saved books:', savedBooksError);
          return { data: null, error: savedBooksError };
        }

        const savedBookIds = (savedBooksData || []).map(item => item.book_id);
        
        if (savedBookIds.length === 0) {
          return { data: [], error: null, hasMore: false, totalCount: 0 };
        }

        // Now search books with those IDs
        const searchQuery = supabase
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
          .in('id', savedBookIds)
          .ilike('title', `%${query.trim()}%`)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        const result = await searchQuery;

        if (result.error) {
          console.error('Error searching books:', result.error);
          return { data: null, error: result.error };
        }

        data = result.data;
        count = result.count;

        // Transform user_books query result
        transformedData = (data || []).map(book => ({
          ...book,
          isSaved: true, // All books from saved list are saved
          collection_title: book.collections?.title || 'Unknown Collection',
          collection_id: book.collections?.id || book.collection
        }));
      } else {
        // Normal search query from books table
        const searchQuery = supabase
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

        const result = await searchQuery;

        if (result.error) {
          console.error('Error searching books:', result.error);
          return { data: null, error: result.error };
        }

        data = result.data;
        count = result.count;

        // If userId provided, check saved status separately
        if (userId && data && data.length > 0) {
          const bookIds = data.map(book => book.id);
          const { data: savedBooksData } = await supabase
            .from('user_books')
            .select('book_id')
            .eq('user_id', userId)
            .in('book_id', bookIds);

          const savedBookIds = new Set((savedBooksData || []).map(item => item.book_id));
          
          transformedData = data.map(book => ({
            ...book,
            isSaved: savedBookIds.has(book.id),
            collection_title: book.collections?.title || 'Unknown Collection',
            collection_id: book.collections?.id || book.collection
          }));
        } else {
          transformedData = data.map(book => ({
            ...book,
            isSaved: false,
            collection_title: book.collections?.title || 'Unknown Collection',
            collection_id: book.collections?.id || book.collection
          }));
        }
      }

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
   * @param {string} userId - User ID for saved status and filtering
   * @param {boolean} savedOnly - If true, only return saved books
   * @returns {Promise<{data: Array, error: any}>}
   */
  async searchInitialBooks(query, userId = null, savedOnly = false) {
    return this.searchBooks(query, 0, SEARCH_RESULTS_PER_PAGE, userId, savedOnly);
  },

  /**
   * Search more books (for pagination)
   * @param {string} query - Search query
   * @param {number} currentCount - Current number of loaded results
   * @param {string} userId - User ID for saved status and filtering
   * @param {boolean} savedOnly - If true, only return saved books
   * @returns {Promise<{data: Array, error: any}>}
   */
  async searchMoreBooks(query, currentCount, userId = null, savedOnly = false) {
    return this.searchBooks(query, currentCount, SEARCH_RESULTS_PER_PAGE, userId, savedOnly);
  }
};
