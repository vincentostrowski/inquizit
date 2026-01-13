import { supabase } from './supabaseClient';
import { spacedRepetitionService } from './spacedRepetitionService';

export const savedItemsService = {
  /**
   * Save a book (insert into user_books)
   * @param {string} userId - User ID
   * @param {number} bookId - Book ID
   * @returns {Promise<{data: any, error: any}>}
   */
  async saveBook(userId, bookId) {
    try {
      const { data, error } = await supabase
        .from('user_books')
        .insert({
          user_id: userId,
          book_id: bookId,
        })
        .select()
        .single();

      if (error) {
        // If error is due to duplicate (already saved), return success
        if (error.code === '23505') {
          return { data: { id: 'existing', user_id: userId, book_id: bookId }, error: null };
        }
        console.error('Error saving book:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error saving book:', error);
      return { data: null, error };
    }
  },

  /**
   * Unsave a book (delete from user_books)
   * If book has saved cards, requires confirmation and will unsave all cards
   * @param {string} userId - User ID
   * @param {number} bookId - Book ID
   * @param {object} options - Options object
   * @param {boolean} options.unsaveCards - If true, also unsave all cards from this book
   * @returns {Promise<{data: any, error: any, requiresConfirmation?: boolean, savedCardsCount?: number}>}
   */
  async unsaveBook(userId, bookId, options = {}) {
    try {
      // Check if book has saved cards
      const savedCardsCount = await this.getSavedCardsCount(userId, bookId);

      // If book has saved cards and unsaveCards option is not set, return confirmation required
      if (savedCardsCount > 0 && !options.unsaveCards) {
        return {
          data: null,
          error: null,
          requiresConfirmation: true,
          savedCardsCount,
        };
      }

      // If unsaveCards is true, delete all saved cards from this book first
      if (options.unsaveCards && savedCardsCount > 0) {
        // Get all card IDs for this book
        const { data: bookDetails } = await supabase
          .from('books')
          .select(`
            cards(id)
          `)
          .eq('id', bookId)
          .single();

        if (bookDetails?.cards) {
          const cardIds = bookDetails.cards.map(card => card.id);
          
          // Delete all saved cards for this book
          const { error: cardsError } = await supabase
            .from('user_cards')
            .delete()
            .eq('user_id', userId)
            .in('card_id', cardIds);

          if (cardsError) {
            console.error('Error unsaving cards:', cardsError);
            return { data: null, error: cardsError };
          }
        }
      }

      // Delete the book from user_books
      const { error } = await supabase
        .from('user_books')
        .delete()
        .eq('user_id', userId)
        .eq('book_id', bookId);

      if (error) {
        console.error('Error unsaving book:', error);
        return { data: null, error };
      }

      return { data: { success: true }, error: null };
    } catch (error) {
      console.error('Unexpected error unsaving book:', error);
      return { data: null, error };
    }
  },

  /**
   * Save a card (insert into user_cards)
   * Business Rule: If book is not saved, automatically save the book first
   * Also initializes spaced repetition fields (queue, ease_factor, etc.)
   * @param {string} userId - User ID
   * @param {number} cardId - Card ID
   * @param {number} bookId - Book ID (required for cascade save)
   * @returns {Promise<{data: any, error: any}>}
   */
  async saveCard(userId, cardId, bookId) {
    try {
      // Business Rule: Check if book is saved, if not, save it first
      const isBookSaved = await this.isBookSaved(userId, bookId);
      
      if (!isBookSaved) {
        // Automatically save the book first
        const { error: bookError } = await this.saveBook(userId, bookId);
        if (bookError) {
          console.error('Error auto-saving book:', bookError);
          return { data: null, error: bookError };
        }
      }

      // Check if card already exists (to avoid resetting spaced repetition data)
      const { data: existingCard } = await supabase
        .from('user_cards')
        .select('*')
        .eq('user_id', userId)
        .eq('card_id', cardId)
        .maybeSingle();

      if (existingCard) {
        // Card already exists, return existing data without resetting spaced repetition fields
        return { data: existingCard, error: null };
      }

      // Initialize spaced repetition fields
      const spacedRepetitionData = await spacedRepetitionService.initializeCardForSpacedRepetition(userId);

      // Now save the card with spaced repetition fields
      const { data, error } = await supabase
        .from('user_cards')
        .insert({
          user_id: userId,
          card_id: cardId,
          queue: spacedRepetitionData.queue,
          due: spacedRepetitionData.due,
          ease_factor: spacedRepetitionData.ease_factor,
          interval_days: spacedRepetitionData.interval_days,
          repetitions: spacedRepetitionData.repetitions,
          last_reviewed_at: spacedRepetitionData.last_reviewed_at,
        })
        .select()
        .single();

      if (error) {
        // If error is due to duplicate (race condition), fetch existing card
        if (error.code === '23505') {
          const { data: existing } = await supabase
            .from('user_cards')
            .select('*')
            .eq('user_id', userId)
            .eq('card_id', cardId)
            .single();
          
          if (existing) {
            return { data: existing, error: null };
          }
        }
        console.error('Error saving card:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error saving card:', error);
      return { data: null, error };
    }
  },

  /**
   * Unsave a card (delete from user_cards)
   * @param {string} userId - User ID
   * @param {number} cardId - Card ID
   * @returns {Promise<{data: any, error: any}>}
   */
  async unsaveCard(userId, cardId) {
    try {
      const { error } = await supabase
        .from('user_cards')
        .delete()
        .eq('user_id', userId)
        .eq('card_id', cardId);

      if (error) {
        console.error('Error unsaving card:', error);
        return { data: null, error };
      }

      return { data: { success: true }, error: null };
    } catch (error) {
      console.error('Unexpected error unsaving card:', error);
      return { data: null, error };
    }
  },

  /**
   * Get all saved books for a user with pagination
   * @param {string} userId - User ID
   * @param {number} offset - Starting index for pagination
   * @param {number} limit - Number of books to fetch
   * @returns {Promise<{data: Array, error: any, hasMore: boolean}>}
   */
  async getSavedBooks(userId, offset = 0, limit = 12) {
    try {
      const { data, error, count } = await supabase
        .from('user_books')
        .select(`
          book_id,
          created_at,
          books (
            id,
            title,
            cover,
            collection,
            header_color,
            background_end_color,
            button_text_border_color,
            button_circle_color
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching saved books:', error);
        return { data: null, error, hasMore: false };
      }

      // Transform the data to include book info
      const transformedData = (data || []).map(item => ({
        ...item.books,
        saved_at: item.created_at,
      }));

      return {
        data: transformedData,
        error: null,
        hasMore: data ? data.length === limit : false,
        totalCount: count || 0,
      };
    } catch (error) {
      console.error('Unexpected error fetching saved books:', error);
      return { data: null, error, hasMore: false };
    }
  },

  /**
   * Get saved cards for a user (optionally filtered by book)
   * @param {string} userId - User ID
   * @param {number} bookId - Optional book ID to filter by
   * @param {number} offset - Starting index for pagination
   * @param {number} limit - Number of cards to fetch
   * @returns {Promise<{data: Array, error: any, hasMore: boolean}>}
   */
  async getSavedCards(userId, bookId = null, offset = 0, limit = 12) {
    try {
      // First, get card IDs for the book if filtering by book
      let cardIds = null;
      if (bookId) {
        const { data: bookCards, error: cardsError } = await supabase
          .from('cards')
          .select('id')
          .eq('book', bookId);

        if (cardsError) {
          console.error('Error fetching book cards:', cardsError);
          return { data: null, error: cardsError, hasMore: false };
        }

        cardIds = (bookCards || []).map(card => card.id);
        if (cardIds.length === 0) {
          return { data: [], error: null, hasMore: false, totalCount: 0 };
        }
      }

      let query = supabase
        .from('user_cards')
        .select(`
          card_id,
          created_at,
          cards (
            id,
            title,
            description,
            content,
            final_order,
            banner,
            section
          )
        `)
        .eq('user_id', userId);

      // If bookId is provided, filter by card IDs from that book
      if (cardIds) {
        query = query.in('card_id', cardIds);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching saved cards:', error);
        return { data: null, error, hasMore: false };
      }

      // Transform the data
      const transformedData = (data || []).map(item => ({
        ...item.cards,
        saved_at: item.created_at,
      }));

      return {
        data: transformedData,
        error: null,
        hasMore: data ? data.length === limit : false,
        totalCount: count || 0,
      };
    } catch (error) {
      console.error('Unexpected error fetching saved cards:', error);
      return { data: null, error, hasMore: false };
    }
  },

  /**
   * Check if a book is saved
   * @param {string} userId - User ID
   * @param {number} bookId - Book ID
   * @returns {Promise<boolean>}
   */
  async isBookSaved(userId, bookId) {
    try {
      const { data, error } = await supabase
        .from('user_books')
        .select('id')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .maybeSingle();

      if (error) {
        console.error('Error checking if book is saved:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Unexpected error checking if book is saved:', error);
      return false;
    }
  },

  /**
   * Check if a card is saved
   * @param {string} userId - User ID
   * @param {number} cardId - Card ID
   * @returns {Promise<boolean>}
   */
  async isCardSaved(userId, cardId) {
    try {
      const { data, error } = await supabase
        .from('user_cards')
        .select('id')
        .eq('user_id', userId)
        .eq('card_id', cardId)
        .maybeSingle();

      if (error) {
        console.error('Error checking if card is saved:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Unexpected error checking if card is saved:', error);
      return false;
    }
  },

  /**
   * Get count of saved cards for a book
   * @param {string} userId - User ID
   * @param {number} bookId - Book ID
   * @returns {Promise<number>}
   */
  async getSavedCardsCount(userId, bookId) {
    try {
      // First, get all card IDs for this book
      const { data: bookCards, error: cardsError } = await supabase
        .from('cards')
        .select('id')
        .eq('book', bookId);

      if (cardsError || !bookCards || bookCards.length === 0) {
        return 0;
      }

      const cardIds = bookCards.map(card => card.id);

      // Count saved cards for this user and book
      const { count, error } = await supabase
        .from('user_cards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .in('card_id', cardIds);

      if (error) {
        console.error('Error getting saved cards count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Unexpected error getting saved cards count:', error);
      return 0;
    }
  },

  /**
   * Batch check saved status for multiple books
   * @param {string} userId - User ID
   * @param {number[]} bookIds - Array of book IDs
   * @returns {Promise<Map<number, boolean>>}
   */
  async getSavedStatusForBooks(userId, bookIds) {
    try {
      const { data, error } = await supabase
        .from('user_books')
        .select('book_id')
        .eq('user_id', userId)
        .in('book_id', bookIds);

      if (error) {
        console.error('Error getting saved status for books:', error);
        return new Map();
      }

      const savedBookIds = new Set((data || []).map(item => item.book_id));
      const statusMap = new Map();
      
      bookIds.forEach(bookId => {
        statusMap.set(bookId, savedBookIds.has(bookId));
      });

      return statusMap;
    } catch (error) {
      console.error('Unexpected error getting saved status for books:', error);
      return new Map();
    }
  },

  /**
   * Batch check saved status for multiple cards
   * @param {string} userId - User ID
   * @param {number[]} cardIds - Array of card IDs
   * @returns {Promise<Map<number, boolean>>}
   */
  async getSavedStatusForCards(userId, cardIds) {
    try {
      const { data, error } = await supabase
        .from('user_cards')
        .select('card_id')
        .eq('user_id', userId)
        .in('card_id', cardIds);

      if (error) {
        console.error('Error getting saved status for cards:', error);
        return new Map();
      }

      const savedCardIds = new Set((data || []).map(item => item.card_id));
      const statusMap = new Map();
      
      cardIds.forEach(cardId => {
        statusMap.set(cardId, savedCardIds.has(cardId));
      });

      return statusMap;
    } catch (error) {
      console.error('Unexpected error getting saved status for cards:', error);
      return new Map();
    }
  },

  /**
   * Toggle save/unsave for a book
   * @param {string} userId - User ID
   * @param {number} bookId - Book ID
   * @returns {Promise<{data: any, error: any, isSaved: boolean}>}
   */
  async toggleBookSave(userId, bookId) {
    try {
      const isSaved = await this.isBookSaved(userId, bookId);
      
      if (isSaved) {
        const result = await this.unsaveBook(userId, bookId);
        return { ...result, isSaved: false };
      } else {
        const result = await this.saveBook(userId, bookId);
        return { ...result, isSaved: true };
      }
    } catch (error) {
      console.error('Unexpected error toggling book save:', error);
      return { data: null, error, isSaved: false };
    }
  },

  /**
   * Toggle save/unsave for a card
   * @param {string} userId - User ID
   * @param {number} cardId - Card ID
   * @param {number} bookId - Book ID (required for cascade save)
   * @returns {Promise<{data: any, error: any, isSaved: boolean}>}
   */
  async toggleCardSave(userId, cardId, bookId) {
    try {
      const isSaved = await this.isCardSaved(userId, cardId);
      
      if (isSaved) {
        const result = await this.unsaveCard(userId, cardId);
        return { ...result, isSaved: false };
      } else {
        const result = await this.saveCard(userId, cardId, bookId);
        return { ...result, isSaved: true };
      }
    } catch (error) {
      console.error('Unexpected error toggling card save:', error);
      return { data: null, error, isSaved: false };
    }
  },
};

