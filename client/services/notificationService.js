import { supabase } from './supabaseClient';

/**
 * Notification Service
 * Handles all operations related to user notifications
 */
export const notificationService = {
  /**
   * Get user's notifications
   * @param {string} userId - User ID
   * @param {number} limit - Maximum number of results
   * @param {number} offset - Offset for pagination
   * @returns {Promise<{data: Array, error: any}>}
   */
  async getNotifications(userId, limit = 50, offset = 0) {
    try {
      if (!userId) {
        return { data: null, error: new Error('User ID is required') };
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('id, type, data, read, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('[notificationService] Error getting notifications:', error);
        return { data: null, error };
      }

      // Collect unique user IDs from notifications
      const userIds = [...new Set((data || [])
        .map(n => n.data?.from_user_id)
        .filter(Boolean))];

      // Fetch all user profiles in one query
      let userProfiles = {};
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, profile_picture_path')
          .in('id', userIds);

        if (!profilesError && profilesData) {
          userProfiles = profilesData.reduce((acc, profile) => {
            acc[profile.id] = {
              id: profile.id,
              username: profile.username,
              profilePicturePath: profile.profile_picture_path,
            };
            return acc;
          }, {});
        }
      }

      // Map notifications with user profiles
      const notifications = (data || []).map((notification) => {
        const fromUserId = notification.data?.from_user_id;
        return {
          id: notification.id,
          type: notification.type,
          data: notification.data,
          read: notification.read,
          createdAt: notification.created_at,
          fromUser: fromUserId ? userProfiles[fromUserId] || null : null,
        };
      });

      return { data: notifications, error: null };
    } catch (error) {
      console.error('[notificationService] Unexpected error getting notifications:', error);
      return { data: null, error };
    }
  },

  /**
   * Mark notification as read
   * @param {string} userId - User ID
   * @param {string} notificationId - Notification ID
   * @returns {Promise<{success: boolean, error: any}>}
   */
  async markNotificationRead(userId, notificationId) {
    try {
      if (!userId || !notificationId) {
        return { success: false, error: new Error('User ID and notification ID are required') };
      }

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error marking notification as read:', error);
      return { success: false, error };
    }
  },

  /**
   * Mark all notifications as read
   * @param {string} userId - User ID
   * @returns {Promise<{success: boolean, error: any}>}
   */
  async markAllNotificationsRead(userId) {
    try {
      if (!userId) {
        return { success: false, error: new Error('User ID is required') };
      }

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error marking all notifications as read:', error);
      return { success: false, error };
    }
  },

  /**
   * Get count of unread notifications
   * @param {string} userId - User ID
   * @returns {Promise<{data: number, error: any}>}
   */
  async getUnreadNotificationCount(userId) {
    try {
      if (!userId) {
        return { data: null, error: new Error('User ID is required') };
      }

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error getting unread notification count:', error);
        return { data: null, error };
      }

      return { data: count || 0, error: null };
    } catch (error) {
      console.error('Unexpected error getting unread notification count:', error);
      return { data: null, error };
    }
  },
};

