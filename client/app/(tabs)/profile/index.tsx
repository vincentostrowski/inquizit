import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Modal, TextInput, Alert, ActionSheetIOS, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import SafeAreaWrapper from '../../../components/common/SafeAreaWrapper';
import ExpertSection from '../../../components/profile/ExpertSection';
import { useAuth } from '../../../context/AuthContext';
import { profileService } from '../../../services/profileService';
import { supabase } from '../../../services/supabaseClient';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUsername, setEditingUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageActionSheetVisible, setImageActionSheetVisible] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    const result = await profileService.getProfile(user.id);
    if (result.error) {
      console.error('Error loading profile:', result.error);
      Alert.alert('Error', 'Failed to load profile');
    } else {
      setProfile(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Request permissions on mount
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload profile pictures!');
        }
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus.status !== 'granted') {
          // Camera permission is optional, so we don't show an alert
        }
      }
    })();
  }, []);

  const handleEditPress = () => {
    if (profile) {
      setEditingUsername(profile.username || '');
      setUsernameError(null);
      setSelectedImage(null);
      setEditModalVisible(true);
    }
  };

  const handleUsernameChange = (text: string) => {
    setEditingUsername(text);
    if (usernameError) {
      setUsernameError(null);
    }
  };

  const showImagePickerOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleTakePhoto();
          } else if (buttonIndex === 2) {
            handlePickImage();
          }
        }
      );
    } else {
      // Android - use Alert
      Alert.alert(
        'Select Photo',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: handleTakePhoto },
          { text: 'Choose from Library', onPress: handlePickImage },
        ]
      );
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    if (!user?.id || !profile) return;

    // Validate username
    if (!editingUsername.trim()) {
      setUsernameError('Username is required');
      return;
    }

    const validation = profileService.validateUsernameFormat(editingUsername);
    if (!validation.valid) {
      setUsernameError(validation.error);
      return;
    }

    // Check availability
    setSaving(true);
    const availability = await profileService.checkUsernameAvailability(editingUsername.trim(), user.id);
    if (!availability.available) {
      setUsernameError(availability.error || 'Username is already taken');
      setSaving(false);
      return;
    }

    try {
      // Update username
      const usernameResult = await profileService.updateUsername(user.id, editingUsername.trim());
      if (usernameResult.error) {
        Alert.alert('Error', usernameResult.error.message || 'Failed to update username');
        setSaving(false);
        return;
      }

      // Upload image if selected
      if (selectedImage) {
        setUploadingImage(true);
        const imageResult = await profileService.updateAvatar(user.id, selectedImage);
        if (imageResult.error) {
          Alert.alert('Error', 'Username updated but failed to upload profile picture. ' + (imageResult.error.message || ''));
          setUploadingImage(false);
          setSaving(false);
          // Still update profile with new username
          setProfile(usernameResult.data);
          setEditModalVisible(false);
          return;
        }
        // Update profile immediately with the new image data
        if (imageResult.data) {
          setProfile(imageResult.data);
        }
        setUploadingImage(false);
      }

      // Reload profile to get latest data (ensures everything is in sync)
      await loadProfile();
      setEditModalVisible(false);
      setSaving(false);
      setSelectedImage(null);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
      setSaving(false);
      setUploadingImage(false);
    }
  };

  const getInitials = (username: string | null | undefined) => {
    if (!username) return '?';
    const parts = username.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <SafeAreaWrapper backgroundColor="#F8F9FA">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper backgroundColor="#F8F9FA">
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Inquizit</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings" size={20} color="#1D1D1F" />
            <Text style={styles.settingsText}>Settings</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.profileSection}>
          {/* Profile Picture */}
          <View style={styles.avatarContainer}>
            {profile?.profile_picture_path ? (
              <Image 
                source={{ 
                  uri: `${supabase.storage.from('profile-pictures').getPublicUrl(profile.profile_picture_path).data.publicUrl}?v=${profile.updated_at || Date.now()}`
                }} 
                style={styles.avatar}
                key={`${profile.id}-${profile.profile_picture_path}`} // Force remount when path changes
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {getInitials(profile?.username)}
                </Text>
              </View>
            )}
          </View>

          {/* Username */}
          <Text style={styles.username}>
            {profile?.username || 'No username'}
          </Text>

          {/* Edit Button */}
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEditPress}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Expert Section */}
        {user?.id && (
          <ExpertSection 
            userId={user.id}
            onBookPress={(bookId) => {
              // TODO: Navigate to book details
              console.log('Navigate to book:', bookId);
            }}
          />
        )}
       
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={[
                  styles.input,
                  usernameError && styles.inputError
                ]}
                placeholder="Username"
                value={editingUsername}
                onChangeText={handleUsernameChange}
                autoCapitalize="none"
                autoComplete="username"
                editable={!saving}
              />
              {usernameError && (
                <Text style={styles.errorText}>{usernameError}</Text>
              )}

              {/* Profile Picture Section */}
              <Text style={styles.inputLabel}>Profile Picture</Text>
              
              {/* Image Preview */}
              {(selectedImage || profile?.profile_picture_path) && (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: selectedImage || supabase.storage.from('profile-pictures').getPublicUrl(profile.profile_picture_path).data.publicUrl }}
                    style={styles.imagePreview}
                  />
                  {selectedImage && (
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => setSelectedImage(null)}
                    >
                      <Ionicons name="close-circle" size={24} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <TouchableOpacity 
                style={styles.imagePickerButton}
                onPress={showImagePickerOptions}
                disabled={saving || uploadingImage}
              >
                {uploadingImage ? (
                  <ActivityIndicator color="#3B82F6" />
                ) : (
                  <>
                    <Ionicons name="camera" size={20} color="#3B82F6" />
                    <Text style={[styles.imagePickerText, { marginLeft: 8 }]}>
                      {selectedImage ? 'Change Picture' : 'Select Picture'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  settingsText: {
    fontSize: 12,
    color: '#1D1D1F',
    fontWeight: '500',
    marginLeft: 6,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#E5E5EA',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E5E5EA',
  },
  avatarPlaceholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    color: '#3B82F6',
    fontSize: 16,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 16,
    alignItems: 'center',
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  imagePickerText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '500',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
