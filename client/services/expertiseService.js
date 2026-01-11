import { supabase } from './supabaseClient';

/**
 * Expertise Service
 * Handles all operations related to the expertness system.
 * Users become "experts" in a book by reviewing all main cards with interval_days > 7.
 */
export const expertiseService = {
  /**
   * Calculate expertise progress for a specific book
   * @param {string} userId - User ID
   * @param {string} bookId - Book ID
   * @returns {Promise<{progress: number, mainCardsTotal: number, mainCardsReviewed: number, isExpert: boolean, error: any}>}
   */
  async calculateBookProgress(userId, bookId) {
    try {
      // Get total main cards for this book
      const { count: mainCardsTotal, error: totalError } = await supabase
        .from('cards')
        .select('*', { count: 'exact', head: true })
        .eq('book', bookId)
        .eq('is_main', true);

      if (totalError) {
        console.error('Error counting main cards:', totalError);
        return { progress: 0, mainCardsTotal: 0, mainCardsReviewed: 0, isExpert: false, error: totalError };
      }

      // If no main cards, can't be expert
      if (!mainCardsTotal || mainCardsTotal === 0) {
        return { progress: 0, mainCardsTotal: 0, mainCardsReviewed: 0, isExpert: false, error: null };
      }

      // Get count of reviewed main cards (interval_days >= 7, due IS NOT NULL)
      const { count: mainCardsReviewed, error: reviewedError } = await supabase
        .from('user_cards')
        .select(`
          card_id,
          cards!inner (
            id,
            book,
            is_main
          )
        `, { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('cards.book', bookId)
        .eq('cards.is_main', true)
        .gte('interval_days', 7)
        .not('due', 'is', null);

      if (reviewedError) {
        console.error('Error counting reviewed main cards:', reviewedError);
        return { progress: 0, mainCardsTotal, mainCardsReviewed: 0, isExpert: false, error: reviewedError };
      }

      const reviewed = mainCardsReviewed || 0;
      const progress = Math.round((reviewed / mainCardsTotal) * 100);
      const isExpert = progress === 100;

      return {
        progress,
        mainCardsTotal,
        mainCardsReviewed: reviewed,
        isExpert,
        error: null,
      };
    } catch (error) {
      console.error('Error calculating book progress:', error);
      return { progress: 0, mainCardsTotal: 0, mainCardsReviewed: 0, isExpert: false, error };
    }
  },

  /**
   * Check and update expertise status for a book
   * Should be called after card reviews that might affect expertise
   * 
   * Race-condition safe: Always calculates fresh progress from user_cards
   * and writes it atomically. Multiple concurrent calls will all calculate
   * the same progress (based on committed user_cards state).
   * 
   * @param {string} userId - User ID
   * @param {string} bookId - Book ID
   * @returns {Promise<{updated: boolean, isExpert: boolean, progress: number, error: any}>}
   */
  async checkAndUpdateExpertise(userId, bookId) {
    try {
      // Calculate current progress (always fresh from user_cards)
      const { progress, mainCardsTotal, mainCardsReviewed, isExpert, error: calcError } = 
        await this.calculateBookProgress(userId, bookId);

      if (calcError) {
        return { updated: false, isExpert: false, progress: 0, error: calcError };
      }

      // Build update data - only update expertise_achieved_at
      // Progress/counts are calculated on-demand, not stored
      const updateData = {
        // Set timestamp if expert, clear if not
        // If multiple calls set this concurrently, the final state is still correct
        expertise_achieved_at: isExpert ? new Date().toISOString() : null,
      };

      // Atomic update - even if called concurrently, final state is correct
      const { data: updatedRow, error: updateError } = await supabase
        .from('user_books')
        .update(updateData)
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .select()
        .maybeSingle();

      if (updateError) {
        console.error('Error updating expertise:', updateError);
        return { updated: false, isExpert, progress, error: updateError };
      }

      // If no row was updated, book isn't saved
      if (!updatedRow) {
        return { updated: false, isExpert: false, progress: 0, error: null };
      }
      return {
        updated: true,
        isExpert,
        progress,
        error: null,
      };
    } catch (error) {
      console.error('Error checking and updating expertise:', error);
      return { updated: false, isExpert: false, progress: 0, error };
    }
  },

  /**
   * Get all books where user is currently an expert
   * @param {string} userId - User ID
   * @returns {Promise<{data: Array, error: any}>}
   */
  async getUserExpertise(userId) {
    try {
      const { data, error } = await supabase
        .from('user_books')
        .select(`
          book_id,
          expertise_achieved_at,
          hide_from_profile,
          books (
            id,
            title,
            cover
          )
        `)
        .eq('user_id', userId)
        .not('expertise_achieved_at', 'is', null)
        .order('expertise_achieved_at', { ascending: false });

      if (error) {
        console.error('Error fetching user expertise:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching user expertise:', error);
      return { data: null, error };
    }
  },

  /**
   * Get expert books visible on public profile (where hide_from_profile = false)
   * @param {string} userId - User ID
   * @returns {Promise<{data: Array, error: any}>}
   */
  async getPublicExpertise(userId) {
    try {
      const { data, error } = await supabase
        .from('user_books')
        .select(`
          book_id,
          expertise_achieved_at,
          books (
            id,
            title,
            cover
          )
        `)
        .eq('user_id', userId)
        .eq('hide_from_profile', false)
        .not('expertise_achieved_at', 'is', null)
        .order('expertise_achieved_at', { ascending: false });

      if (error) {
        console.error('Error fetching public expertise:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching public expertise:', error);
      return { data: null, error };
    }
  },

  /**
   * Toggle profile visibility for an expert book
   * @param {string} userId - User ID
   * @param {string} bookId - Book ID
   * @param {boolean} hide - Whether to hide from profile
   * @returns {Promise<{success: boolean, error: any}>}
   */
  async toggleProfileVisibility(userId, bookId, hide) {
    try {
      const { error } = await supabase
        .from('user_books')
        .update({ hide_from_profile: hide })
        .eq('user_id', userId)
        .eq('book_id', bookId);

      if (error) {
        console.error('Error toggling profile visibility:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error toggling profile visibility:', error);
      return { success: false, error };
    }
  },

  /**
   * Get expertise progress for a specific book (for book detail UI)
   * Always calculates fresh progress from user_cards
   * @param {string} userId - User ID
   * @param {string} bookId - Book ID
   * @returns {Promise<{data: {progress: number, mainCardsTotal: number, mainCardsReviewed: number, isExpert: boolean, achievedAt: string|null, hideFromProfile: boolean} | null, error: any}>}
   */
  async getBookExpertiseDetails(userId, bookId) {
    try {
      // Get user_books row for achievedAt and hideFromProfile
      const { data: userBook, error: userBookError } = await supabase
        .from('user_books')
        .select('expertise_achieved_at, hide_from_profile')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .maybeSingle();

      if (userBookError) {
        console.error('Error fetching book expertise details:', userBookError);
        return { data: null, error: userBookError };
      }

      // Always calculate progress fresh
      const { progress, mainCardsTotal, mainCardsReviewed, isExpert, error: calcError } = 
        await this.calculateBookProgress(userId, bookId);

      if (calcError) {
        return { data: null, error: calcError };
      }

      return {
        data: {
          progress,
          mainCardsTotal,
          mainCardsReviewed,
          isExpert,
          achievedAt: userBook?.expertise_achieved_at || null,
          hideFromProfile: userBook?.hide_from_profile || false,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error fetching book expertise details:', error);
      return { data: null, error };
    }
  },

  /**
   * Batch update expertise for all books a user has saved
   * Useful for initial calculation or periodic recalculation
   * @param {string} userId - User ID
   * @returns {Promise<{updated: number, errors: number, error: any}>}
   */
  async recalculateAllExpertise(userId) {
    try {
      // Get all saved books for user
      const { data: savedBooks, error: fetchError } = await supabase
        .from('user_books')
        .select('book_id')
        .eq('user_id', userId);

      if (fetchError) {
        console.error('Error fetching saved books:', fetchError);
        return { updated: 0, errors: 0, error: fetchError };
      }

      if (!savedBooks || savedBooks.length === 0) {
        return { updated: 0, errors: 0, error: null };
      }

      let updated = 0;
      let errors = 0;

      // Update expertise for each book
      for (const book of savedBooks) {
        const result = await this.checkAndUpdateExpertise(userId, book.book_id);
        if (result.error) {
          errors++;
        } else if (result.updated) {
          updated++;
        }
      }

      return { updated, errors, error: null };
    } catch (error) {
      console.error('Error recalculating all expertise:', error);
      return { updated: 0, errors: 0, error };
    }
  },
};

