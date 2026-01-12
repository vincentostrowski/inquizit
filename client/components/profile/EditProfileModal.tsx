import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, ActionSheetIOS, Platform, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { profileService } from '../../services/profileService';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  profile: any;
  onProfileUpdate?: () => void;
}

export default function EditProfileModal({ visible, onClose, profile, onProfileUpdate }: EditProfileModalProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [editingUsername, setEditingUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  // Modal animation
  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      // Backdrop fades in first
      backdropOpacity.value = withTiming(0.5, { duration: 200 });
      // Then sheet slides up
      translateY.value = withDelay(100, withTiming(0, { duration: 300 }));
    } else {
      // Both animations happen simultaneously on close
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
      backdropOpacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(handleClose)();
      });
    }
  }, [visible]);

  // Reset form when modal opens
  useEffect(() => {
    if (visible && profile) {
      setEditingUsername(profile.username || '');
      setUsernameError(null);
      setSelectedImage(null);
    }
  }, [visible, profile]);

  const animatedSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const animatedBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
    };
  });

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
          onProfileUpdate?.();
          onClose();
          return;
        }
        setUploadingImage(false);
      }

      // Notify parent to reload profile
      onProfileUpdate?.();
      setSaving(false);
      setSelectedImage(null);
      Alert.alert('Success', 'Profile updated successfully');
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
      setSaving(false);
      setUploadingImage(false);
    }
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.modalOverlay}>
        <Animated.View style={[styles.modalBackdrop, animatedBackdropStyle]}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            onPress={onClose}
            activeOpacity={1}
          />
        </Animated.View>
        <Animated.View style={[styles.modalContent, { paddingBottom: insets.bottom + 40 }, animatedSheetStyle]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity
              onPress={onClose}
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
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
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

