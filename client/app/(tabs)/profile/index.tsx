import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import SafeAreaWrapper from '../../../components/common/SafeAreaWrapper';
import ProfileContent from '../../../components/profile/ProfileContent';
import EditProfileModal from '../../../components/profile/EditProfileModal';
import { useAuth } from '../../../context/AuthContext';
import { profileService } from '../../../services/profileService';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);

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
      setEditModalVisible(true);
    }
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
          <TouchableOpacity style={styles.settingsButton} onPress={handleEditPress}>
            <Ionicons name="settings-outline" size={20} color="#1D1D1F" />
            <Text style={styles.settingsText}>Settings</Text>
          </TouchableOpacity>
        </View>
        
        {user?.id && profile && (
          <ProfileContent
            userId={user.id}
            profile={profile}
            loading={loading}
          />
        )}
       
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        profile={profile}
        onProfileUpdate={loadProfile}
      />
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
});
