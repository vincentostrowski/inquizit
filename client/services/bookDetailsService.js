import { supabase } from './supabaseClient';

export const bookDetailsService = {
  /**
   * Fetch complete book details with sections and cards
   * @param {number} bookId - ID of the book
   * @returns {Promise<{data: Object, error: any}>}
   */
  async fetchBookDetails(bookId) {
    try {
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
              section_id: card.section
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
