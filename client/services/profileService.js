import { supabase } from './supabaseClient';
import * as FileSystem from 'expo-file-system';

/**
 * Profile Service
 * Handles all profile-related operations including fetching, updating username, and managing avatar
 */

export const profileService = {
  /**
   * Fetch user profile by user ID
   * @param {string} userId - The user's UUID
   * @returns {Promise<{data: Object|null, error: any}>}
   */
  async getProfile(userId) {
    try {
      if (!userId) {
        return { data: null, error: new Error('User ID is required') };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, profile_picture_path, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      return { data: null, error };
    }
  },

  /**
   * Validate username format
   * @param {string} username - Username to validate
   * @returns {{valid: boolean, error: string|null}}
   */
  validateUsernameFormat(username) {
    if (!username || typeof username !== 'string') {
      return { valid: false, error: 'Username is required' };
    }

    const trimmed = username.trim();

    if (trimmed.length === 0) {
      return { valid: false, error: 'Username cannot be empty' };
    }

    if (trimmed.length < 3) {
      return { valid: false, error: 'Username must be at least 3 characters' };
    }

    if (trimmed.length > 30) {
      return { valid: false, error: 'Username must be 30 characters or less' };
    }

    // Only alphanumeric characters and underscores
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(trimmed)) {
      return { 
        valid: false, 
        error: 'Username can only contain letters, numbers, and underscores' 
      };
    }

    return { valid: true, error: null };
  },

  /**
   * Check if username is available (unique)
   * @param {string} username - Username to check
   * @param {string} currentUserId - Current user's ID (to exclude from uniqueness check)
   * @returns {Promise<{available: boolean, error: string|null}>}
   */
  async checkUsernameAvailability(username, currentUserId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('username', username.trim())
        .maybeSingle();

      if (error) {
        console.error('Error checking username availability:', error);
        return { available: false, error: error.message };
      }

      // If no profile found, username is available
      if (!data) {
        return { available: true, error: null };
      }

      // If found profile belongs to current user, username is available (for updates)
      if (data.id === currentUserId) {
        return { available: true, error: null };
      }

      // Username is taken by another user
      return { available: false, error: 'Username is already taken' };
    } catch (error) {
      console.error('Unexpected error checking username availability:', error);
      return { available: false, error: error.message };
    }
  },

  /**
   * Validate username (format + availability)
   * @param {string} username - Username to validate
   * @param {string} currentUserId - Current user's ID
   * @returns {Promise<{valid: boolean, error: string|null}>}
   */
  async validateUsername(username, currentUserId) {
    // First check format
    const formatCheck = this.validateUsernameFormat(username);
    if (!formatCheck.valid) {
      return formatCheck;
    }

    // Then check availability
    const availabilityCheck = await this.checkUsernameAvailability(username, currentUserId);
    if (!availabilityCheck.available) {
      return { valid: false, error: availabilityCheck.error };
    }

    return { valid: true, error: null };
  },

  /**
   * Update username
   * @param {string} userId - The user's UUID
   * @param {string} username - New username
   * @returns {Promise<{data: Object|null, error: any}>}
   */
  async updateUsername(userId, username) {
    try {
      if (!userId) {
        return { data: null, error: new Error('User ID is required') };
      }

      // Validate username
      const validation = await this.validateUsername(username, userId);
      if (!validation.valid) {
        return { data: null, error: new Error(validation.error) };
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          username: username.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating username:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error updating username:', error);
      return { data: null, error };
    }
  },

  /**
   * Upload avatar image to Supabase Storage
   * @param {string} userId - The user's UUID
   * @param {string} imageUri - Local file URI from expo-image-picker
   * @returns {Promise<{data: {publicUrl: string, path: string}|null, error: any}>}
   */
  async uploadAvatar(userId, imageUri) {
    try {
      if (!userId) {
        return { data: null, error: new Error('User ID is required') };
      }

      if (!imageUri) {
        return { data: null, error: new Error('Image URI is required') };
      }

      // Determine file extension from URI or default to jpg
      const fileExtension = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
      const ext = validExtensions.includes(fileExtension) ? fileExtension : 'jpg';

      // Create storage path: profile-pictures/{user_id}/avatar.{ext}
      const storagePath = `${userId}/avatar.${ext}`;

      // Read the file as base64 using expo-file-system
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 string to ArrayBuffer
      // This is the format Supabase expects for React Native
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const arrayBuffer = bytes.buffer;
      
      // Upload to Supabase Storage using ArrayBuffer
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(storagePath, arrayBuffer, {
          contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
          upsert: true, // Replace existing avatar
        });

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        return { data: null, error: uploadError };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(storagePath);

      return { 
        data: { 
          publicUrl, 
          path: storagePath 
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Unexpected error uploading avatar:', error);
      return { data: null, error };
    }
  },

  /**
   * Update profile picture path in profile
   * @param {string} userId - The user's UUID
   * @param {string} picturePath - Storage path of the profile picture
   * @returns {Promise<{data: Object|null, error: any}>}
   */
  async updateProfilePicturePath(userId, picturePath) {
    try {
      if (!userId) {
        return { data: null, error: new Error('User ID is required') };
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          profile_picture_path: picturePath,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile picture path:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error updating profile picture path:', error);
      return { data: null, error };
    }
  },

  /**
   * Upload and update profile picture in one operation
   * @param {string} userId - The user's UUID
   * @param {string} imageUri - Local file URI from expo-image-picker
   * @returns {Promise<{data: Object|null, error: any}>}
   */
  async updateAvatar(userId, imageUri) {
    try {
      // First upload the image
      const uploadResult = await this.uploadAvatar(userId, imageUri);
      if (uploadResult.error) {
        return uploadResult;
      }

      // Then update the profile with the storage path
      const updateResult = await this.updateProfilePicturePath(userId, uploadResult.data.path);
      return updateResult;
    } catch (error) {
      console.error('Unexpected error updating avatar:', error);
      return { data: null, error };
    }
  },

  /**
   * Delete avatar (remove from storage and clear from profile)
   * @param {string} userId - The user's UUID
   * @returns {Promise<{data: Object|null, error: any}>}
   */
  async deleteAvatar(userId) {
    try {
      if (!userId) {
        return { data: null, error: new Error('User ID is required') };
      }

      // Get current profile to find avatar path
      const profileResult = await this.getProfile(userId);
      if (profileResult.error) {
        return profileResult;
      }

      const profile = profileResult.data;
      if (profile?.profile_picture_path) {
        // Delete from storage using the stored path
        const { error: storageError } = await supabase.storage
          .from('profile-pictures')
          .remove([profile.profile_picture_path]);

        if (storageError) {
          console.error('Error deleting profile picture from storage:', storageError);
          // Continue to clear path even if storage delete fails
        }
      }

      // Clear profile picture path from profile
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          profile_picture_path: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error clearing avatar URL:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error deleting avatar:', error);
      return { data: null, error };
    }
  },
};

