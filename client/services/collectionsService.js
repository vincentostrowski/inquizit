import { supabase } from './supabaseClient';

const COLLECTIONS_PER_PAGE = 5;

export const collectionsService = {
  /**
   * Get all collections to identify parent-child relationships
   * @returns {Promise<{data: Array, error: any}>}
   */
  async getAllCollections() {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*');

      if (error) {
        console.error('Error fetching all collections:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Unexpected error fetching all collections:', error);
      return { data: null, error };
    }
  },

  /**
   * Filter out parent collections and return only leaf collections
   * @param {Array} allCollections - All collections from database
   * @returns {Array} - Only leaf collections (no children)
   */
  filterLeafCollections(allCollections) {
    if (!allCollections || allCollections.length === 0) return [];

    // Create a set of parent IDs (collections that have children)
    const parentIds = new Set();
    allCollections.forEach(collection => {
      if (collection.parent !== null) {
        parentIds.add(collection.parent);
      }
    });

    // Return only collections that are not parents
    return allCollections.filter(collection => !parentIds.has(collection.id));
  },

  /**
   * Fetch leaf collections with pagination
   * @param {number} offset - Starting index for pagination
   * @param {number} limit - Number of collections to fetch
   * @returns {Promise<{data: Array, error: any}>}
   */
  async fetchCollections(offset = 0, limit = COLLECTIONS_PER_PAGE) {
    try {
      // First get all collections to determine parent-child relationships
      const { data: allCollections, error: allError } = await this.getAllCollections();
      
      if (allError) {
        console.error('Error fetching all collections:', allError);
        return { data: null, error: allError };
      }

      // Filter to get only leaf collections
      const leafCollections = this.filterLeafCollections(allCollections);

      // Apply pagination to leaf collections
      const paginatedCollections = leafCollections.slice(offset, offset + limit);

      return { 
        data: paginatedCollections, 
        error: null, 
        hasMore: leafCollections.length > offset + limit,
        totalCount: leafCollections.length
      };
    } catch (error) {
      console.error('Unexpected error fetching collections:', error);
      return { data: null, error };
    }
  },

  /**
   * Fetch more collections (for pagination)
   * @param {number} currentCount - Current number of loaded collections
   * @returns {Promise<{data: Array, error: any}>}
   */
  async fetchMoreCollections(currentCount) {
    return this.fetchCollections(currentCount, COLLECTIONS_PER_PAGE);
  }
};
