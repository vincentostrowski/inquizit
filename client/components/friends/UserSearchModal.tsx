import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { friendsService } from '../../services/friendsService';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';
import UserProfileModal from '../profile/UserProfileModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface User {
  id: string;
  username: string;
  profile_picture_path: string | null;
}

interface Friend {
  friendshipId: string;
  friendId: string;
  username: string;
  profilePicturePath: string | null;
  createdAt: string;
}

interface FriendshipStatus {
  status: 'none' | 'pending' | 'accepted' | 'self';
  friendshipId: string | null;
  isIncoming: boolean;
}

interface UserSearchModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function UserSearchModal({ visible, onClose }: UserSearchModalProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendshipStatuses, setFriendshipStatuses] = useState<Record<string, FriendshipStatus>>({});
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = () => {
    setIsVisible(false);
    // Close profile modal if open
    if (showUserProfile) {
      setShowUserProfile(false);
      setSelectedUserId(null);
    }
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

  // Clean up selectedUserId when profile modal closes
  useEffect(() => {
    if (!showUserProfile && selectedUserId) {
      // Delay cleanup to allow animation to complete
      const timer = setTimeout(() => {
        setSelectedUserId(null);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [showUserProfile, selectedUserId]);

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

  // Fetch friends when modal opens
  useEffect(() => {
    if (visible && user?.id) {
      loadFriends();
    } else if (!visible) {
      // Reset friends when modal closes
      setFriends([]);
      setFilteredFriends([]);
    }
  }, [visible, user?.id]);

  // Filter friends based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFriends(friends);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase().trim();
    const filtered = friends.filter(friend =>
      friend.username.toLowerCase().includes(lowerQuery)
    );
    setFilteredFriends(filtered);
  }, [searchQuery, friends]);

  // Debounce search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, friends]);

  const loadFriends = async () => {
    if (!user?.id) return;

    setFriendsLoading(true);
    const { data, error } = await friendsService.getFriends(user.id);

    if (error) {
      console.error('Error loading friends:', error);
      setFriendsLoading(false);
      return;
    }

    setFriends(data || []);
    setFilteredFriends(data || []);
    setFriendsLoading(false);
  };

  const performSearch = async () => {
    if (!searchQuery.trim() || !user?.id) return;

    setLoading(true);

    const { data, error } = await friendsService.searchUsers(searchQuery.trim(), 20, 0);

    if (error) {
      console.error('Error searching users:', error);
      setLoading(false);
      return;
    }

    // Filter out friends from search results
    const friendIds = new Set(friends.map(f => f.friendId));
    const filteredResults = (data || []).filter(user => !friendIds.has(user.id));

    setSearchResults(filteredResults);
    
    // Get friendship statuses for all results
    if (filteredResults && filteredResults.length > 0) {
      const statusPromises = filteredResults.map(async (resultUser) => {
        const statusResult = await friendsService.getFriendshipStatus(user.id, resultUser.id);
        return { userId: resultUser.id, status: statusResult.data };
      });

      const statuses = await Promise.all(statusPromises);
      const statusMap: Record<string, FriendshipStatus> = {};
      statuses.forEach(({ userId, status }) => {
        if (status) {
          statusMap[userId] = status as FriendshipStatus;
        }
      });
      setFriendshipStatuses(statusMap);
    }

    setLoading(false);
  };

  const handleSendRequest = async (friendId: string) => {
    if (!user?.id) return;

    const { error } = await friendsService.sendFriendRequest(user.id, friendId);
    if (error) {
      console.error('Error sending friend request:', error);
      return;
    }

    // Update friendship status
    const statusResult = await friendsService.getFriendshipStatus(user.id, friendId);
    if (statusResult.data && (statusResult.data.status === 'none' || statusResult.data.status === 'pending' || statusResult.data.status === 'accepted' || statusResult.data.status === 'self')) {
      setFriendshipStatuses((prev) => ({
        ...prev,
        [friendId]: statusResult.data as FriendshipStatus,
      }));
    }
  };

  const handleAcceptRequest = async (friendshipId: string, friendId: string) => {
    if (!user?.id) return;

    const { error } = await friendsService.acceptFriendRequest(user.id, friendshipId);
    if (error) {
      console.error('Error accepting friend request:', error);
      return;
    }

    // Update friendship status
    const statusResult = await friendsService.getFriendshipStatus(user.id, friendId);
    if (statusResult.data && (statusResult.data.status === 'none' || statusResult.data.status === 'pending' || statusResult.data.status === 'accepted' || statusResult.data.status === 'self')) {
      setFriendshipStatuses((prev) => ({
        ...prev,
        [friendId]: statusResult.data as FriendshipStatus,
      }));
    }
  };

  const handleDeclineRequest = async (friendshipId: string, friendId: string) => {
    if (!user?.id) return;

    const { error } = await friendsService.declineFriendRequest(user.id, friendshipId);
    if (error) {
      console.error('Error declining friend request:', error);
      return;
    }

    // Update friendship status
    const statusResult = await friendsService.getFriendshipStatus(user.id, friendId);
    if (statusResult.data && (statusResult.data.status === 'none' || statusResult.data.status === 'pending' || statusResult.data.status === 'accepted' || statusResult.data.status === 'self')) {
      setFriendshipStatuses((prev) => ({
        ...prev,
        [friendId]: statusResult.data as FriendshipStatus,
      }));
    }
  };

  const handleCancelRequest = async (friendshipId: string, friendId: string) => {
    if (!user?.id) return;

    const { error } = await friendsService.cancelFriendRequest(user.id, friendshipId);
    if (error) {
      console.error('Error canceling friend request:', error);
      return;
    }

    // Update friendship status
    const statusResult = await friendsService.getFriendshipStatus(user.id, friendId);
    if (statusResult.data && (statusResult.data.status === 'none' || statusResult.data.status === 'pending' || statusResult.data.status === 'accepted' || statusResult.data.status === 'self')) {
      setFriendshipStatuses((prev) => ({
        ...prev,
        [friendId]: statusResult.data as FriendshipStatus,
      }));
    }
  };

  const getStatusButton = (userId: string) => {
    const status = friendshipStatuses[userId];
    if (!status) return null;

    if (status.status === 'self') {
      return null; // Don't show button for self
    }

    if (status.status === 'accepted') {
      return (
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Friends</Text>
        </View>
      );
    }

    if (status.status === 'pending') {
      if (status.isIncoming) {
        // Show both Accept and Decline buttons
        return (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.declineButton]}
              onPress={() => status.friendshipId && handleDeclineRequest(status.friendshipId, userId)}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { marginLeft: 8 }]}
              onPress={() => status.friendshipId && handleAcceptRequest(status.friendshipId, userId)}
            >
              <Text style={styles.actionButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        );
      } else {
        // Outgoing pending - show Cancel button
        return (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => status.friendshipId && handleCancelRequest(status.friendshipId, userId)}
          >
            <Text style={styles.cancelButtonText}>Cancel Request</Text>
          </TouchableOpacity>
        );
      }
    }

    // status === 'none'
    return (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleSendRequest(userId)}
        >
          <Ionicons name="person-add-outline" size={16} color="#1D1D1F" />
          <Text style={styles.addButtonText}>Add Friend</Text>
        </TouchableOpacity>
    );
  };

  const getProfilePictureUri = (profilePicturePath: string | null) => {
    if (!profilePicturePath) return null;
    return supabase.storage.from('profile-pictures').getPublicUrl(profilePicturePath).data.publicUrl;
  };

  const getInitials = (username: string) => {
    if (!username) return '?';
    const parts = username.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.container}>
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + 34 }, animatedSheetStyle]}>
          <View style={styles.handleBar} />
          
          <View style={styles.header}>
            <Text style={styles.title}>Search Users</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by username..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#C7C7CC" />
              </TouchableOpacity>
            )}
          </View>

          {/* Content ScrollView */}
          <ScrollView 
            style={styles.contentScroll} 
            contentContainerStyle={styles.contentScrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Friends Section - Only show if there are filtered friends */}
            {friendsLoading ? (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Friends</Text>
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#8E8E93" />
                </View>
              </View>
            ) : filteredFriends.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Friends</Text>
                <View style={styles.friendsList}>
                  {filteredFriends.map((friend) => (
                    <TouchableOpacity
                      key={friend.friendId}
                      style={styles.userRow}
                      onPress={() => {
                        setSelectedUserId(friend.friendId);
                        setShowUserProfile(true);
                      }}
                      activeOpacity={0.7}
                    >
                      {/* Profile Picture */}
                      {getProfilePictureUri(friend.profilePicturePath) ? (
                        <Image
                          source={{ uri: getProfilePictureUri(friend.profilePicturePath)! }}
                          style={styles.avatar}
                        />
                      ) : (
                        <View style={styles.avatarPlaceholder}>
                          <Text style={styles.avatarPlaceholderText}>
                            {getInitials(friend.username)}
                          </Text>
                        </View>
                      )}

                      {/* Username */}
                      <Text style={styles.username} numberOfLines={1}>
                        {friend.username}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Search Results Section */}
            {searchQuery.trim() && (
              <View style={styles.section}>
                {filteredFriends.length > 0 && <View style={styles.sectionDivider} />}
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#8E8E93" />
                  </View>
                ) : searchResults.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No users found</Text>
                  </View>
                ) : (
                  <View style={styles.resultsList}>
                    {searchResults.map((resultUser) => (
                      <TouchableOpacity
                        key={resultUser.id}
                        style={styles.userRow}
                        onPress={() => {
                          setSelectedUserId(resultUser.id);
                          setShowUserProfile(true);
                        }}
                        activeOpacity={0.7}
                      >
                        {/* Profile Picture */}
                        {getProfilePictureUri(resultUser.profile_picture_path) ? (
                          <Image
                            source={{ uri: getProfilePictureUri(resultUser.profile_picture_path)! }}
                            style={styles.avatar}
                          />
                        ) : (
                          <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarPlaceholderText}>
                              {getInitials(resultUser.username)}
                            </Text>
                          </View>
                        )}

                        {/* Username */}
                        <Text style={styles.username} numberOfLines={1}>
                          {resultUser.username}
                        </Text>

                        {/* Status Button */}
                        {/* <View style={styles.statusContainer}>
                          {getStatusButton(resultUser.id)}
                        </View> */}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </GestureHandlerRootView>
      
      {/* User Profile Modal */}
      {selectedUserId && (
        <UserProfileModal
          visible={showUserProfile}
          onClose={() => {
            // Only set showUserProfile to false immediately
            // The modal's handleClose will be called after animation completes
            // We'll clean up selectedUserId in a separate effect or callback
            setShowUserProfile(false);
          }}
          userId={selectedUserId}
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    flex: 1,
    flexDirection: 'column',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1D1D1F',
    padding: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  contentScroll: {
    flex: 1,
  },
  contentScrollContainer: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 12,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginTop: 8,
    marginBottom: 16,
  },
  friendsList: {
    marginTop: 0,
  },
  resultsList: {
    marginTop: 0,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  username: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
    marginLeft: 12,
  },
  statusContainer: {
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1D1D1F',
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  declineButton: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  declineButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1D1D1F',
  },
});

