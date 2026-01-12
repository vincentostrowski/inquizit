import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Pressable,
  Dimensions,
} from 'react-native';
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
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';
import UserProfileModal from '../profile/UserProfileModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Notification {
  id: string;
  type: string;
  data: any;
  read: boolean;
  createdAt: string;
  fromUser: {
    id: string;
    username: string;
    profilePicturePath: string | null;
  } | null;
}

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  onNotificationRead?: () => void; // Callback to refresh unread count
}

export default function NotificationsModal({
  visible,
  onClose,
  onNotificationRead,
}: NotificationsModalProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Load notifications when modal opens
  useEffect(() => {
    if (visible && user?.id) {
      loadNotifications();
    }
  }, [visible, user?.id]);

  const loadNotifications = async () => {
    if (!user?.id) {
      return;
    }

    setLoading(true);
    const { data, error } = await notificationService.getNotifications(user.id);

    if (error) {
      console.error('[NotificationsModal] Error loading notifications:', error);
    } else {
      setNotifications(data || []);
    }
    setLoading(false);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user?.id) return;

    const { success, error } = await notificationService.markNotificationRead(
      user.id,
      notificationId
    );

    if (error) {
      console.error('Error marking notification as read:', error);
      return;
    }

    if (success) {
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );

      // Notify parent to refresh unread count
      onNotificationRead?.();
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;

    const { success, error } = await notificationService.markAllNotificationsRead(user.id);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return;
    }

    if (success) {
      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

      // Notify parent to refresh unread count
      onNotificationRead?.();
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    // Handle different notification types
    if (notification.fromUser) {
      setSelectedUserId(notification.fromUser.id);
      setShowUserProfile(true);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request_received':
        return 'person-add-outline';
      case 'friend_request_accepted':
        return 'checkmark-circle-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationTitle = (notification: Notification) => {
    const fromUsername = notification.fromUser?.username || 'Someone';

    switch (notification.type) {
      case 'friend_request_received':
        return `${fromUsername} sent you a friend request`;
      case 'friend_request_accepted':
        return `${fromUsername} accepted your friend request`;
      default:
        return 'New notification';
    }
  };

  const getProfilePictureUri = (profilePicturePath: string | null) => {
    if (!profilePicturePath) return null;
    return supabase.storage
      .from('profile-pictures')
      .getPublicUrl(profilePicturePath).data.publicUrl;
  };

  const getInitials = (username: string) => {
    if (!username) return '?';
    const parts = username.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    // For older notifications, show date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

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

  const unreadCount = notifications.filter((n) => !n.read).length;

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
        <Animated.View
          style={[styles.sheet, { paddingBottom: insets.bottom + 34 }, animatedSheetStyle]}
        >
          <View style={styles.handleBar} />

          <View style={styles.header}>
            <Text style={styles.title}>Notifications</Text>
            <View style={styles.headerRight}>
              {unreadCount > 0 && (
                <TouchableOpacity
                  onPress={handleMarkAllAsRead}
                  style={styles.markAllButton}
                >
                  <Text style={styles.markAllText}>Mark all read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#8E8E93" />
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-outline" size={48} color="#C7C7CC" />
              <Text style={styles.emptyText}>No notifications</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.notificationsList}
              contentContainerStyle={styles.notificationsListContent}
              showsVerticalScrollIndicator={false}
            >
              {notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationRow,
                    !notification.read && styles.unreadNotification,
                  ]}
                  onPress={() => handleNotificationPress(notification)}
                  activeOpacity={0.7}
                >
                  {/* Profile Picture */}
                  {notification.fromUser ? (
                    getProfilePictureUri(notification.fromUser.profilePicturePath) ? (
                      <Image
                        source={{
                          uri: getProfilePictureUri(
                            notification.fromUser.profilePicturePath
                          )!,
                        }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarPlaceholderText}>
                          {getInitials(notification.fromUser.username)}
                        </Text>
                      </View>
                    )
                  ) : (
                    <View style={styles.iconContainer}>
                      <Ionicons
                        name={getNotificationIcon(notification.type)}
                        size={20}
                        color="#8E8E93"
                      />
                    </View>
                  )}

                  {/* Notification Content */}
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>
                      {getNotificationTitle(notification)}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {formatTimestamp(notification.createdAt)}
                    </Text>
                  </View>

                  {/* Unread Indicator */}
                  {!notification.read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </Animated.View>
      </GestureHandlerRootView>

      {/* User Profile Modal */}
      {selectedUserId && (
        <UserProfileModal
          visible={showUserProfile}
          onClose={() => {
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: SCREEN_HEIGHT * 0.85,
    flexDirection: 'column',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#C7C7CC',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  markAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
  notificationsList: {
    flex: 1,
  },
  notificationsListContent: {
    flexGrow: 1,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    backgroundColor: '#FFFFFF',
  },
  unreadNotification: {
    backgroundColor: '#F8F9FA',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarPlaceholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 13,
    color: '#8E8E93',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginLeft: 8,
  },
});

