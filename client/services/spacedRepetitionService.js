import { supabase } from './supabaseClient';

/**
 * Spaced Repetition Service
 * Handles all operations related to spaced repetition system using Anki algorithm
 */
export const spacedRepetitionService = {
  /**
   * Initialize card for spaced repetition (internal helper)
   * Calculates next queue value and returns initialization data
   * @param {string} userId - User ID
   * @returns {Promise<{queue: number, due: null, ease_factor: number, interval_days: number, repetitions: number, last_reviewed_at: null}>}
   */
  async initializeCardForSpacedRepetition(userId) {
    try {
      // Get max queue value for user's new cards (where due IS NULL)
      // Only consider values >= 0 (ignore -1 which is temporary)
      const { data: maxQueueData, error: maxError } = await supabase
        .from('user_cards')
        .select('queue')
        .eq('user_id', userId)
        .is('due', null)
        .gte('queue', 0)
        .order('queue', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (maxError && maxError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error getting max queue:', maxError);
        throw maxError;
      }

      // If no cards exist, start at 0, otherwise add 1 to max
      const nextQueue = (maxQueueData?.queue ?? -1) + 1;

      return {
        queue: nextQueue,
        due: null,
        ease_factor: 2.5,
        interval_days: 0,
        repetitions: 0,
        last_reviewed_at: null,
      };
    } catch (error) {
      console.error('Error initializing card for spaced repetition:', error);
      throw error;
    }
  },

  /**
   * Get new concept queue (cards not yet reviewed)
   * @param {string} userId - User ID
   * @param {number} limit - Optional limit for pagination
   * @param {number} offset - Optional offset for pagination
   * @returns {Promise<{data: any[], error: any}>}
   */
  async getNewConceptQueue(userId, limit, offset = 0) {
    try {
      let query = supabase
        .from('user_cards')
        .select(`
          *,
          cards (
            id,
            title,
            description,
            book,
            books (
              id,
              title,
              cover
            )
          )
        `)
        .eq('user_id', userId)
        .is('due', null)
        .order('queue', { ascending: true });

      if (limit) {
        query = query.range(offset, offset + limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching new concept queue:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Unexpected error fetching new concept queue:', error);
      return { data: null, error };
    }
  },

  /**
   * Get review queue (all cards in review system - cards with due date set)
   * @param {string} userId - User ID
   * @param {number} limit - Optional limit for pagination
   * @param {number} offset - Optional offset for pagination
   * @returns {Promise<{data: any[], error: any}>}
   */
  async getReviewQueue(userId, limit, offset = 0) {
    try {
      let query = supabase
        .from('user_cards')
        .select(`
          *,
          cards (
            id,
            title,
            description,
            book,
            books (
              id,
              title,
              cover
            )
          )
        `)
        .eq('user_id', userId)
        .not('due', 'is', null)
        .order('due', { ascending: true });

      if (limit) {
        query = query.range(offset, offset + limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching review queue:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Unexpected error fetching review queue:', error);
      return { data: null, error };
    }
  },

  /**
   * Move one or more cards to top of New Concept Queue
   * @param {string} userId - User ID
   * @param {number|number[]} cardIds - Single cardId or array of cardIds
   * @returns {Promise<{data: any[], error: any}>}
   */
  async moveCardsToTopOfQueue(userId, cardIds) {
    try {
      // Normalize input: convert single cardId to array
      const cardIdsArray = Array.isArray(cardIds) ? cardIds : [cardIds];

      if (cardIdsArray.length === 0) {
        return { data: [], error: null };
      }

      // Fetch cards to move with their current queue values to preserve relative order
      const { data: cardsToMove, error: fetchError } = await supabase
        .from('user_cards')
        .select('id, card_id, queue')
        .eq('user_id', userId)
        .in('card_id', cardIdsArray)
        .is('due', null);

      if (fetchError) {
        console.error('Error fetching cards to move:', fetchError);
        return { data: null, error: fetchError };
      }

      if (!cardsToMove || cardsToMove.length === 0) {
        return { data: [], error: null };
      }

      // Sort by current queue to preserve relative order
      cardsToMove.sort((a, b) => (a.queue ?? Infinity) - (b.queue ?? Infinity));

      // Step 1: Set all moved cards to queue = -1 (temporary to avoid conflicts)
      const { error: tempError } = await supabase
        .from('user_cards')
        .update({ queue: -1 })
        .eq('user_id', userId)
        .in('card_id', cardIdsArray)
        .is('due', null);

      if (tempError) {
        console.error('Error setting temporary queue values:', tempError);
        return { data: null, error: tempError };
      }

      // Step 2: Increment all other cards (where queue >= 0 AND due IS NULL) by numberOfMovedCards
      const { error: incrementError } = await supabase.rpc('increment_queue_values', {
        p_user_id: userId,
        p_increment_by: cardsToMove.length,
      });

      if (incrementError) {
        console.error('Error incrementing queue values:', incrementError);
        return { data: null, error: incrementError };
      }

      // Step 3: Set moved cards to queue = 0, 1, 2, ... (maintaining relative order)
      const updatePromises = cardsToMove.map(async (card, index) => {
        const newQueueValue = index; // 0, 1, 2, 3...
        
        const updateResult = await supabase
          .from('user_cards')
          .update({ queue: newQueueValue })
          .eq('id', card.id)
          .select('*');
        
        return updateResult;
      });

      const updateResults = await Promise.all(updatePromises);
      
      const hasError = updateResults.some(result => result.error);
      if (hasError) {
        const errorResult = updateResults.find(r => r.error);
        console.error('Error updating queue values:', errorResult.error);
        return { data: null, error: errorResult.error };
      }

      // Fetch and return updated cards
      const { data: updatedCards, error: fetchUpdatedError } = await supabase
        .from('user_cards')
        .select(`
          *,
          cards (
            id,
            title,
            description,
            book,
            books (
              id,
              title,
              cover
            )
          )
        `)
        .eq('user_id', userId)
        .in('card_id', cardIdsArray)
        .is('due', null);

      if (fetchUpdatedError) {
        console.error('Error fetching updated cards:', fetchUpdatedError);
        return { data: null, error: fetchUpdatedError };
      }

      return { data: updatedCards || [], error: null };
    } catch (error) {
      console.error('Unexpected error moving cards to top of queue:', error);
      return { data: null, error };
    }
  },

  /**
   * Review a card and update spaced repetition data using Anki algorithm
   * @param {string} userId - User ID
   * @param {number} cardId - Card ID
   * @param {number} rating - Rating: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
   * @returns {Promise<{data: any, error: any}>}
   */
  async reviewCard(userId, cardId, rating) {
    try {
      // Validate rating
      if (![1, 2, 3, 4].includes(rating)) {
        return { data: null, error: new Error('Invalid rating. Must be 1, 2, 3, or 4') };
      }

      // Fetch current card data
      const { data: currentCard, error: fetchError } = await supabase
        .from('user_cards')
        .select('*')
        .eq('user_id', userId)
        .eq('card_id', cardId)
        .single();

      if (fetchError) {
        console.error('Error fetching card for review:', fetchError);
        return { data: null, error: fetchError };
      }

      if (!currentCard) {
        return { data: null, error: new Error('Card not found') };
      }

      const isFirstReview = currentCard.queue !== null && currentCard.due === null;
      const currentEaseFactor = currentCard.ease_factor ?? 2.5;
      const currentInterval = currentCard.interval_days ?? 0;
      const currentRepetitions = currentCard.repetitions ?? 0;

      let newEaseFactor = currentEaseFactor;
      let newInterval = currentInterval;
      let newRepetitions = currentRepetitions;

      // Anki algorithm calculations
      if (rating === 1) {
        // Again: Reset to 1 day, decrease ease factor
        newInterval = 1;
        newEaseFactor = Math.max(1.3, currentEaseFactor - 0.20);
        newRepetitions = 0;
      } else if (rating === 2) {
        // Hard: Interval = previous interval × 1.2, decrease ease factor
        newInterval = Math.max(1, Math.floor(currentInterval * 1.2));
        newEaseFactor = Math.max(1.3, currentEaseFactor - 0.15);
        newRepetitions = currentRepetitions;
      } else if (rating === 3) {
        // Good: Interval = previous interval × ease_factor, increase ease factor
        if (isFirstReview) {
          newInterval = 1; // First review is always 1 day
        } else {
          newInterval = Math.max(1, Math.floor(currentInterval * currentEaseFactor));
        }
        newEaseFactor = Math.min(2.5, currentEaseFactor + 0.15);
        newRepetitions = currentRepetitions + 1;
      } else if (rating === 4) {
        // Easy: Interval = previous interval × ease_factor × 1.3, increase ease factor
        if (isFirstReview) {
          newInterval = 4; // First review with Easy is 4 days
        } else {
          newInterval = Math.max(1, Math.floor(currentInterval * currentEaseFactor * 1.3));
        }
        newEaseFactor = Math.min(2.5, currentEaseFactor + 0.15);
        newRepetitions = currentRepetitions + 1;
      }

      // Calculate new due date
      const now = new Date();
      const newDueDate = new Date(now);
      newDueDate.setDate(newDueDate.getDate() + newInterval);

      // Format due date as YYYY-MM-DD (DATE type in database, not timestamp)
      const formatDateString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Update card
      const updateData = {
        due: formatDateString(newDueDate), // YYYY-MM-DD format for DATE column
        queue: null, // Remove from new queue if it was there
        ease_factor: newEaseFactor,
        interval_days: newInterval,
        repetitions: newRepetitions,
        last_reviewed_at: now.toISOString(),
      };

      const { data: updatedCard, error: updateError } = await supabase
        .from('user_cards')
        .update(updateData)
        .eq('user_id', userId)
        .eq('card_id', cardId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating card after review:', updateError);
        return { data: null, error: updateError };
      }

      return { data: updatedCard, error: null };
    } catch (error) {
      console.error('Unexpected error reviewing card:', error);
      return { data: null, error };
    }
  },

  /**
   * Get queue statistics
   * @param {string} userId - User ID
   * @returns {Promise<{data: {newCards: number, dueCards: number, totalScheduled: number, newCardsLeftToday: number, cardsDueToday: number, streak: number}, error: any}>}
   */
  async getQueueStats(userId) {
    try {
      const now = new Date().toISOString();
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Get new cards count
      const { count: newCardsCount } = await supabase
        .from('user_cards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('due', null);

      // Get cards due today
      const { count: dueTodayCount } = await supabase
        .from('user_cards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('due', 'is', null)
        .lte('due', now);

      // Get total scheduled cards (cards with due date set)
      const { count: totalScheduledCount } = await supabase
        .from('user_cards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('due', 'is', null);

      // Get daily new card count
      const dailyNewCardCount = await this.getDailyNewCardCount(userId, today);

      // Get current streak
      const streakData = await this.getCurrentStreak(userId);

      return {
        data: {
          newCards: newCardsCount || 0,
          dueCards: dueTodayCount || 0,
          totalScheduled: totalScheduledCount || 0,
          newCardsLeftToday: Math.max(0, 10 - (dailyNewCardCount || 0)),
          cardsDueToday: dueTodayCount || 0,
          streak: streakData?.streak || 0,
        },
        error: null,
      };
    } catch (error) {
      console.error('Unexpected error getting queue stats:', error);
      return { data: null, error };
    }
  },

  /**
   * Get cards for spaced repetition quizit session
   * @param {string} userId - User ID
   * @returns {Promise<{data: {cardIds: number[], newCardCount: number, reviewCardCount: number, totalCount: number}, error: any}>}
   */
  async getCardsForSpacedRepetitionSession(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const dailyNewCardCount = await this.getDailyNewCardCount(userId, today);
      const newCardsLeft = Math.max(0, 10 - dailyNewCardCount);

      // Get new cards (up to daily limit)
      const { data: newCards, error: newCardsError } = await this.getNewConceptQueue(
        userId,
        newCardsLeft
      );

      if (newCardsError) {
        console.error('Error fetching new cards for session:', newCardsError);
        return { data: null, error: newCardsError };
      }

      // Get review cards (due today)
      const { data: reviewCards, error: reviewCardsError } = await this.getReviewQueue(userId);

      if (reviewCardsError) {
        console.error('Error fetching review cards for session:', reviewCardsError);
        return { data: null, error: reviewCardsError };
      }

      // Extract card IDs (keep separate for ordering)
      const newCardIds = (newCards || []).map(card => card.card_id);
      const reviewCardIds = (reviewCards || []).map(card => card.card_id);
      
      // Combine: REVIEW CARDS FIRST, then new cards
      // This ensures review cards (due) are prioritized over new cards
      const allCardIds = [...reviewCardIds, ...newCardIds];

      return {
        data: {
          cardIds: allCardIds,           // Combined, ordered: review first, then new
          reviewCardIds: reviewCardIds,  // Separate list for tracking
          newCardIds: newCardIds,        // Separate list for tracking
          newCardCount: newCardIds.length,
          reviewCardCount: reviewCardIds.length,
          totalCount: allCardIds.length,
        },
        error: null,
      };
    } catch (error) {
      console.error('Unexpected error getting cards for session:', error);
      return { data: null, error };
    }
  },

  /**
   * Record daily review activity
   * @param {string} userId - User ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {number} cardCount - Total number of cards reviewed
   * @param {number} newCardCount - Number of new cards reviewed
   * @returns {Promise<{data: any, error: any}>}
   */
  async recordDailyReview(userId, date, cardCount, newCardCount) {
    try {
      // Try to update existing record first
      const { data: existing, error: fetchError } = await supabase
        .from('user_daily_reviews')
        .select('*')
        .eq('user_id', userId)
        .eq('review_date', date)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing daily review:', fetchError);
        return { data: null, error: fetchError };
      }

      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from('user_daily_reviews')
          .update({
            review_count: existing.review_count + cardCount,
            new_cards_reviewed: existing.new_cards_reviewed + newCardCount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating daily review:', error);
          return { data: null, error };
        }

        return { data, error: null };
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('user_daily_reviews')
          .insert({
            user_id: userId,
            review_date: date,
            review_count: cardCount,
            new_cards_reviewed: newCardCount,
          })
          .select()
          .single();

        if (error) {
          console.error('Error inserting daily review:', error);
          return { data: null, error };
        }

        return { data, error: null };
      }
    } catch (error) {
      console.error('Unexpected error recording daily review:', error);
      return { data: null, error };
    }
  },

  /**
   * Get consistency data for date range (for GitHub-style graph)
   * @param {string} userId - User ID
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<{data: Array<{date: string, count: number}>, error: any}>}
   */
  async getConsistencyData(userId, startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('user_daily_reviews')
        .select('review_date, review_count')
        .eq('user_id', userId)
        .gte('review_date', startDate)
        .lte('review_date', endDate)
        .order('review_date', { ascending: true });

      if (error) {
        console.error('Error fetching consistency data:', error);
        return { data: null, error };
      }

      const formattedData = (data || []).map(item => ({
        date: item.review_date,
        count: item.review_count || 0,
      }));

      return { data: formattedData, error: null };
    } catch (error) {
      console.error('Unexpected error fetching consistency data:', error);
      return { data: null, error };
    }
  },

  /**
   * Get daily new card count for a specific date
   * @param {string} userId - User ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<number>}
   */
  async getDailyNewCardCount(userId, date) {
    try {
      const { data, error } = await supabase
        .from('user_daily_reviews')
        .select('new_cards_reviewed')
        .eq('user_id', userId)
        .eq('review_date', date)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching daily new card count:', error);
        return 0;
      }

      return data?.new_cards_reviewed || 0;
    } catch (error) {
      console.error('Unexpected error fetching daily new card count:', error);
      return 0;
    }
  },

  /**
   * Get current streak (consecutive days with reviews)
   * @param {string} userId - User ID
   * @returns {Promise<{streak: number, lastReviewDate: string|null}>}
   */
  async getCurrentStreak(userId) {
    try {
      const { data, error } = await supabase
        .from('user_daily_reviews')
        .select('review_date, review_count')
        .eq('user_id', userId)
        .gt('review_count', 0)
        .order('review_date', { ascending: false });

      if (error) {
        console.error('Error fetching streak data:', error);
        return { streak: 0, lastReviewDate: null };
      }

      if (!data || data.length === 0) {
        return { streak: 0, lastReviewDate: null };
      }

      // Calculate streak by checking consecutive days
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if today or yesterday has a review
      const todayStr = today.toISOString().split('T')[0];
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const hasToday = data.some(d => d.review_date === todayStr);
      const hasYesterday = data.some(d => d.review_date === yesterdayStr);

      // If no review today or yesterday, streak is 0
      if (!hasToday && !hasYesterday) {
        return { streak: 0, lastReviewDate: data[0]?.review_date || null };
      }

      // Start counting from today or yesterday
      let checkDate = hasToday ? today : yesterday;
      streak = hasToday ? 1 : 0;

      // Count backwards for consecutive days
      for (let i = hasToday ? 1 : 0; i < data.length; i++) {
        const expectedDate = new Date(checkDate);
        expectedDate.setDate(expectedDate.getDate() - 1);
        const expectedDateStr = expectedDate.toISOString().split('T')[0];

        if (data[i]?.review_date === expectedDateStr) {
          streak++;
          checkDate = expectedDate;
        } else {
          break;
        }
      }

      return {
        streak,
        lastReviewDate: data[0]?.review_date || null,
      };
    } catch (error) {
      console.error('Unexpected error calculating streak:', error);
      return { streak: 0, lastReviewDate: null };
    }
  },
};

