import { supabase } from './supabaseClient';

/**
 * Friends Service
 * Handles all operations related to friendships and friend requests
 */
export const friendsService = {
  /**
   * Search for users by username
   * @param {string} query - Search query (username)
   * @param {number} limit - Maximum number of results
   * @param {number} offset - Offset for pagination
   * @returns {Promise<{data: Array, error: any}>}
   */
  async searchUsers(query, limit = 20, offset = 0) {
    try {
      if (!query || query.trim().length === 0) {
        return { data: [], error: null };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, profile_picture_path')
        .ilike('username', `%${query.trim()}%`)
        .order('username')
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error searching users:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Unexpected error searching users:', error);
      return { data: null, error };
    }
  },

  /**
   * Get friendship status between two users
   * @param {string} userId - Current user ID
   * @param {string} otherUserId - Other user ID
   * @returns {Promise<{data: {status: string, friendshipId: string|null, isIncoming: boolean}|null, error: any}>}
   */
  async getFriendshipStatus(userId, otherUserId) {
    try {
      if (!userId || !otherUserId) {
        return { data: null, error: new Error('User IDs are required') };
      }

      if (userId === otherUserId) {
        return { data: { status: 'self', friendshipId: null, isIncoming: false }, error: null };
      }

      // Check if friendship exists (either direction)
      const { data, error } = await supabase
        .from('friendships')
        .select('id, user_id, friend_id, status')
        .or(`and(user_id.eq.${userId},friend_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},friend_id.eq.${userId})`)
        .maybeSingle();

      if (error) {
        console.error('Error getting friendship status:', error);
        return { data: null, error };
      }

      if (!data) {
        return { data: { status: 'none', friendshipId: null, isIncoming: false }, error: null };
      }

      const isIncoming = data.friend_id === userId;
      return {
        data: {
          status: data.status,
          friendshipId: data.id,
          isIncoming,
        },
        error: null,
      };
    } catch (error) {
      console.error('Unexpected error getting friendship status:', error);
      return { data: null, error };
    }
  },

  /**
   * Send a friend request
   * @param {string} userId - User sending the request
   * @param {string} friendId - User receiving the request
   * @returns {Promise<{data: Object|null, error: any}>}
   */
  async sendFriendRequest(userId, friendId) {
    try {
      if (!userId || !friendId) {
        return { data: null, error: new Error('User ID and friend ID are required') };
      }

      if (userId === friendId) {
        return { data: null, error: new Error('Cannot send friend request to yourself') };
      }

      // Check if friendship already exists
      const statusResult = await this.getFriendshipStatus(userId, friendId);
      if (statusResult.error) {
        return statusResult;
      }

      if (statusResult.data.status !== 'none') {
        return { data: null, error: new Error('Friendship already exists') };
      }

      // Create friend request
      const { data, error } = await supabase
        .from('friendships')
        .insert({
          user_id: userId,
          friend_id: friendId,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending friend request:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error sending friend request:', error);
      return { data: null, error };
    }
  },

  /**
   * Accept a friend request
   * @param {string} userId - User accepting the request
   * @param {string} friendshipId - Friendship ID to accept
   * @returns {Promise<{data: Object|null, error: any}>}
   */
  async acceptFriendRequest(userId, friendshipId) {
    try {
      if (!userId || !friendshipId) {
        return { data: null, error: new Error('User ID and friendship ID are required') };
      }

      // Get the friendship to verify it's incoming and pending
      const { data: friendship, error: fetchError } = await supabase
        .from('friendships')
        .select('id, user_id, friend_id, status')
        .eq('id', friendshipId)
        .single();

      if (fetchError) {
        console.error('Error fetching friendship:', fetchError);
        return { data: null, error: fetchError };
      }

      if (!friendship) {
        return { data: null, error: new Error('Friendship not found') };
      }

      if (friendship.friend_id !== userId) {
        return { data: null, error: new Error('Not authorized to accept this request') };
      }

      if (friendship.status !== 'pending') {
        return { data: null, error: new Error('Friendship is not pending') };
      }

      // Update friendship status to accepted
      const { data, error } = await supabase
        .from('friendships')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', friendshipId)
        .select()
        .single();

      if (error) {
        console.error('Error accepting friend request:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error accepting friend request:', error);
      return { data: null, error };
    }
  },

  /**
   * Cancel an outgoing friend request
   * @param {string} userId - User canceling the request
   * @param {string} friendshipId - Friendship ID to cancel
   * @returns {Promise<{success: boolean, error: any}>}
   */
  async cancelFriendRequest(userId, friendshipId) {
    try {
      if (!userId || !friendshipId) {
        return { success: false, error: new Error('User ID and friendship ID are required') };
      }

      // Get the friendship to verify it's outgoing and pending
      const { data: friendship, error: fetchError } = await supabase
        .from('friendships')
        .select('id, user_id, friend_id, status')
        .eq('id', friendshipId)
        .single();

      if (fetchError) {
        console.error('Error fetching friendship:', fetchError);
        return { success: false, error: fetchError };
      }

      if (!friendship) {
        return { success: false, error: new Error('Friendship not found') };
      }

      if (friendship.user_id !== userId) {
        return { success: false, error: new Error('Not authorized to cancel this request') };
      }

      if (friendship.status !== 'pending') {
        return { success: false, error: new Error('Friendship is not pending') };
      }

      // Delete the friendship (canceling removes it)
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) {
        console.error('Error canceling friend request:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error canceling friend request:', error);
      return { success: false, error };
    }
  },

  /**
   * Decline a friend request
   * @param {string} userId - User declining the request
   * @param {string} friendshipId - Friendship ID to decline
   * @returns {Promise<{success: boolean, error: any}>}
   */
  async declineFriendRequest(userId, friendshipId) {
    try {
      if (!userId || !friendshipId) {
        return { success: false, error: new Error('User ID and friendship ID are required') };
      }

      // Get the friendship to verify it's incoming and pending
      const { data: friendship, error: fetchError } = await supabase
        .from('friendships')
        .select('id, friend_id, status')
        .eq('id', friendshipId)
        .single();

      if (fetchError) {
        console.error('Error fetching friendship:', fetchError);
        return { success: false, error: fetchError };
      }

      if (!friendship) {
        return { success: false, error: new Error('Friendship not found') };
      }

      if (friendship.friend_id !== userId) {
        return { success: false, error: new Error('Not authorized to decline this request') };
      }

      if (friendship.status !== 'pending') {
        return { success: false, error: new Error('Friendship is not pending') };
      }

      // Delete the friendship (declining removes it)
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) {
        console.error('Error declining friend request:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error declining friend request:', error);
      return { success: false, error };
    }
  },

  /**
   * Get incoming friend requests (requests sent TO the user)
   * @param {string} userId - User ID
   * @returns {Promise<{data: Array, error: any}>}
   */
  async getIncomingFriendRequests(userId) {
    try {
      if (!userId) {
        return { data: null, error: new Error('User ID is required') };
      }

      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          user_id,
          friend_id,
          status,
          created_at,
          user:user_id (
            id,
            username,
            profile_picture_path
          )
        `)
        .eq('friend_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting incoming friend requests:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Unexpected error getting incoming friend requests:', error);
      return { data: null, error };
    }
  },

  /**
   * Get list of accepted friends
   * @param {string} userId - User ID
   * @returns {Promise<{data: Array, error: any}>}
   */
  async getFriends(userId) {
    try {
      if (!userId) {
        return { data: null, error: new Error('User ID is required') };
      }

      // Get friendships where user is either user_id or friend_id and status is accepted
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('id, user_id, friend_id, created_at')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting friendships:', error);
        return { data: null, error };
      }

      if (!friendships || friendships.length === 0) {
        return { data: [], error: null };
      }

      // Collect all friend user IDs
      const friendIds = friendships.map((friendship) => {
        return friendship.user_id === userId ? friendship.friend_id : friendship.user_id;
      });

      // Fetch profiles for all friends
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, profile_picture_path')
        .in('id', friendIds);

      if (profilesError) {
        console.error('Error getting friend profiles:', profilesError);
        return { data: null, error: profilesError };
      }

      // Create a map of user ID to profile
      const profileMap = {};
      (profiles || []).forEach((profile) => {
        profileMap[profile.id] = profile;
      });

      // Transform to get friend profile (the other user)
      const friends = friendships.map((friendship) => {
        const friendId = friendship.user_id === userId ? friendship.friend_id : friendship.user_id;
        const profile = profileMap[friendId];
        
        if (!profile) {
          return null; // Skip if profile not found
        }

        return {
          friendshipId: friendship.id,
          friendId: profile.id,
          username: profile.username,
          profilePicturePath: profile.profile_picture_path,
          createdAt: friendship.created_at,
        };
      }).filter(Boolean); // Remove any null entries

      return { data: friends, error: null };
    } catch (error) {
      console.error('Unexpected error getting friends:', error);
      return { data: null, error };
    }
  },

  /**
   * Remove a friend (unfriend)
   * @param {string} userId - Current user ID
   * @param {string} friendshipId - Friendship ID to remove
   * @returns {Promise<{success: boolean, error: any}>}
   */
  async removeFriend(userId, friendshipId) {
    try {
      if (!userId || !friendshipId) {
        return { success: false, error: new Error('User ID and friendship ID are required') };
      }

      // Get the friendship to verify user is part of it
      const { data: friendship, error: fetchError } = await supabase
        .from('friendships')
        .select('id, user_id, friend_id, status')
        .eq('id', friendshipId)
        .single();

      if (fetchError) {
        console.error('Error fetching friendship:', fetchError);
        return { success: false, error: fetchError };
      }

      if (!friendship) {
        return { success: false, error: new Error('Friendship not found') };
      }

      // Verify user is part of this friendship
      if (friendship.user_id !== userId && friendship.friend_id !== userId) {
        return { success: false, error: new Error('Not authorized to remove this friendship') };
      }

      // Verify friendship is accepted (can only remove accepted friendships)
      if (friendship.status !== 'accepted') {
        return { success: false, error: new Error('Can only remove accepted friendships') };
      }

      // Delete the friendship
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) {
        console.error('Error removing friend:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error removing friend:', error);
      return { success: false, error };
    }
  },
};

