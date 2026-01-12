import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import SafeAreaWrapper from '../../../components/common/SafeAreaWrapper';
import ExpertSection from '../../../components/profile/ExpertSection';
import CardsLearnedSection from '../../../components/profile/CardsLearnedSection';
import ConsistencyGraph from '../../../components/schedule/ConsistencyGraph';
import ActivitySection from '../../../components/profile/ActivitySection';
import EditProfileModal from '../../../components/profile/EditProfileModal';
import { useAuth } from '../../../context/AuthContext';
import { profileService } from '../../../services/profileService';
import { supabase } from '../../../services/supabaseClient';

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
          <TouchableOpacity style={styles.settingsButton} onPress={handleEditPress}>
            <Ionicons name="settings-outline" size={20} color="#1D1D1F" />
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
        </View>

        {/* Cards Learned Section */}
        {user?.id && (
          <CardsLearnedSection userId={user.id} />
        )}

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

        {/* Consistency Graph Section */}
        {user?.id && (
          <View style={styles.consistencySection}>
            <View style={styles.consistencyHeader}>
              <Text style={styles.consistencySectionTitle}>Consistency</Text>
              <View style={styles.consistencyHeaderLine} />
            </View>
            <ConsistencyGraph userId={user.id} />
          </View>
        )}

        {/* Activity Section */}
        {user?.id && (
          <ActivitySection userId={user.id} />
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
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
  },
  consistencySection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  consistencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  consistencySectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
    marginRight: 12,
  },
  consistencyHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5EA',
  },
});
