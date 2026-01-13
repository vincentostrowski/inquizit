import { supabase } from './supabaseClient';
import { savedItemsService } from './savedItemsService';

export const bookDetailsService = {
  /**
   * Fetch complete book details with sections and cards
   * Hybrid approach: Book saved status fetched separately (one row), cards saved status in separate batch query
   * @param {number} bookId - ID of the book
   * @param {string} userId - User ID for fetching saved status
   * @returns {Promise<{data: Object, error: any}>}
   */
  async fetchBookDetails(bookId, userId = null) {
    try {
      // Main query for book details
      const { data, error } = await supabase
        .from('books')
        .select(`
          id,
          title,
          description,
          header_color,
          background_end_color,
          button_text_border_color,
          button_circle_color,
          card_sections (
            id,
            title,
            order,
            description
          ),
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
        .eq('id', bookId)
        .single();

      if (error) {
        console.error('Error fetching book details:', error);
        return { data: null, error };
      }

      // Extract all card IDs for batch query
      const cardIds = (data.cards || []).map(card => card.id);

      // Fetch saved status for book using savedItemsService
      let isBookSaved = false;
      if (userId) {
        isBookSaved = await savedItemsService.isBookSaved(userId, bookId);
      }

      // Fetch saved status for cards in a separate batch query using savedItemsService
      let savedCardsStatus = new Set();
      if (userId && cardIds.length > 0) {
        const cardsStatusMap = await savedItemsService.getSavedStatusForCards(userId, cardIds);
        // Convert Map to Set for O(1) lookup
        cardsStatusMap.forEach((isSaved, cardId) => {
          if (isSaved) {
            savedCardsStatus.add(cardId);
          }
        });
      }

      // Transform the data to a more usable structure
      const transformedData = {
        book: {
          id: data.id,
          title: data.title,
          description: data.description,
          header_color: data.header_color,
          background_end_color: data.background_end_color,
          button_text_border_color: data.button_text_border_color,
          button_circle_color: data.button_circle_color,
          isSaved: isBookSaved,
        },
        sections: (data.card_sections || []).map(section => ({
          id: section.id,
          title: section.title,
          order: section.order,
          description: section.description,
          cards: (data.cards || [])
            .filter(card => card.section === section.id)
            .sort((a, b) => (a.final_order || 0) - (b.final_order || 0))
            .map(card => ({
              id: card.id,
              title: card.title,
              description: card.description,
              content: card.content,
              final_order: card.final_order,
              banner: card.banner,
              section_id: card.section,
              isSaved: savedCardsStatus.has(card.id),
            }))
        })).sort((a, b) => (a.order || 0) - (b.order || 0))
      };

      return { data: transformedData, error: null };
    } catch (error) {
      console.error('Unexpected error fetching book details:', error);
      return { data: null, error };
    }
  }
};
