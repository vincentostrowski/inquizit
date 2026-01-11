import { supabase } from './supabaseClient';

/**
 * Cards Learned Service
 * Handles fetching statistics about cards the user has learned.
 * A card is "learned" when interval_days >= 7 AND due IS NOT NULL.
 */

// ============================================
// MOCK DATA - Use for styling/development
// ============================================
export const MOCK_CARDS_LEARNED_DATA = {
  totalUniqueCards: 147,
  categories: [
    { categoryId: 'psychology', categoryName: 'Psychology', count: 52 },
    { categoryId: 'self-help', categoryName: 'Self Help', count: 41 },
    { categoryId: 'business', categoryName: 'Business', count: 38 },
    { categoryId: 'philosophy', categoryName: 'Philosophy', count: 29 },
    { categoryId: 'productivity', categoryName: 'Productivity', count: 24 },
    { categoryId: 'communication', categoryName: 'Communication', count: 18 },
    { categoryId: 'leadership', categoryName: 'Leadership', count: 15 },
    { categoryId: 'relationships', categoryName: 'Relationships', count: 12 },
    { categoryId: 'strategy', categoryName: 'Strategy', count: 9 },
    { categoryId: 'creativity', categoryName: 'Creativity', count: 6 },
  ],
};

export const cardsLearnedService = {
  /**
   * Get full cards learned stats (for modal - all categories)
   * @param {string} userId - User ID
   * @returns {Promise<{data: {totalUniqueCards: number, categories: Array}, error: any}>}
   */
  async getCardsLearnedStats(userId) {
    try {
      // Get total unique learned cards
      const { count: totalUniqueCards, error: totalError } = await supabase
        .from('user_cards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('interval_days', 7)
        .not('due', 'is', null);

      if (totalError) {
        console.error('Error counting total learned cards:', totalError);
        return { data: null, error: totalError };
      }

      // Get learned cards with their book's categories
      // This query joins user_cards -> cards -> books -> book_categories -> categories
      const { data: learnedCards, error: cardsError } = await supabase
        .from('user_cards')
        .select(`
          card_id,
          cards!inner (
            id,
            book,
            books!inner (
              id,
              book_categories (
                category_id,
                categories (
                  id,
                  name
                )
              )
            )
          )
        `)
        .eq('user_id', userId)
        .gte('interval_days', 7)
        .not('due', 'is', null);

      if (cardsError) {
        console.error('Error fetching learned cards with categories:', cardsError);
        return { data: null, error: cardsError };
      }

      // Count cards per category
      const categoryCounts = {};
      
      for (const userCard of learnedCards || []) {
        const bookCategories = userCard.cards?.books?.book_categories || [];
        
        for (const bc of bookCategories) {
          const category = bc.categories;
          if (category) {
            if (!categoryCounts[category.id]) {
              categoryCounts[category.id] = {
                categoryId: category.id,
                categoryName: category.name,
                count: 0,
              };
            }
            categoryCounts[category.id].count++;
          }
        }
      }

      // Convert to array and sort by count (descending)
      const categories = Object.values(categoryCounts).sort((a, b) => b.count - a.count);

      return {
        data: {
          totalUniqueCards: totalUniqueCards || 0,
          categories,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error getting cards learned stats:', error);
      return { data: null, error };
    }
  },

  /**
   * Get summary for profile UI (total + top 5 categories)
   * @param {string} userId - User ID
   * @returns {Promise<{data: {totalUniqueCards: number, topCategories: Array}, error: any}>}
   */
  async getCardsLearnedSummary(userId) {
    const { data, error } = await this.getCardsLearnedStats(userId);
    
    if (error || !data) {
      return { data: null, error };
    }

    return {
      data: {
        totalUniqueCards: data.totalUniqueCards,
        topCategories: data.categories.slice(0, 5),
      },
      error: null,
    };
  },
};

