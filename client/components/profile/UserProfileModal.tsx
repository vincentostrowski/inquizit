import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ProfileContent from "./ProfileContent";
import { profileService } from "../../services/profileService";
import { friendsService } from "../../services/friendsService";
import { useAuth } from "../../context/AuthContext";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface FriendshipStatus {
  status: 'none' | 'pending' | 'accepted' | 'self';
  friendshipId: string | null;
  isIncoming: boolean;
}

interface UserProfileModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
}

export default function UserProfileModal({
  visible,
  onClose,
  userId,
}: UserProfileModalProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const [isVisible, setIsVisible] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus | null>(null);

  const handleClose = () => {
    setIsVisible(false);
    // Reset animation values for next open
    translateY.value = SCREEN_HEIGHT;
    backdropOpacity.value = 0;
    onClose();
  };

  // Modal animation
  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      // Backdrop fades in first
      backdropOpacity.value = withTiming(0.6, { duration: 200 });
      // Then modal slides up
      translateY.value = withDelay(100, withTiming(0, { duration: 300 }));
    } else {
      // Both animations happen simultaneously on close
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
      backdropOpacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(handleClose)();
      });
    }
  }, [visible]);

  // Load profile and friendship status when modal opens
  useEffect(() => {
    if (visible && userId) {
      loadProfile();
      loadFriendshipStatus();
    }
  }, [visible, userId]);

  const loadProfile = async () => {
    if (!userId) return;

    setLoading(true);
    const result = await profileService.getProfile(userId);
    if (result.error) {
      console.error("Error loading profile:", result.error);
      // Optionally close modal on error
    } else {
      setProfile(result.data);
    }
    setLoading(false);
  };

  const loadFriendshipStatus = async () => {
    if (!user?.id || !userId) return;

    const result = await friendsService.getFriendshipStatus(user.id, userId);
    if (result.data && (result.data.status === 'none' || result.data.status === 'pending' || result.data.status === 'accepted' || result.data.status === 'self')) {
      setFriendshipStatus(result.data as FriendshipStatus);
    }
  };

  const handleSendRequest = async () => {
    if (!user?.id || !userId) return;

    const { error } = await friendsService.sendFriendRequest(user.id, userId);
    if (error) {
      console.error('Error sending friend request:', error);
      return;
    }

    await loadFriendshipStatus();
  };

  const handleAcceptRequest = async () => {
    if (!user?.id || !userId || !friendshipStatus?.friendshipId) return;

    const { error } = await friendsService.acceptFriendRequest(user.id, friendshipStatus.friendshipId);
    if (error) {
      console.error('Error accepting friend request:', error);
      return;
    }

    await loadFriendshipStatus();
  };

  const handleRemoveFriend = async () => {
    if (!user?.id || !userId || !friendshipStatus?.friendshipId) return;

    const { error } = await friendsService.removeFriend(user.id, friendshipStatus.friendshipId);
    if (error) {
      console.error('Error removing friend:', error);
      return;
    }

    await loadFriendshipStatus();
  };

  const handleCancelRequest = async () => {
    if (!user?.id || !userId || !friendshipStatus?.friendshipId) return;

    const { error } = await friendsService.cancelFriendRequest(user.id, friendshipStatus.friendshipId);
    if (error) {
      console.error('Error canceling friend request:', error);
      return;
    }

    await loadFriendshipStatus();
  };

  const handleDeclineRequest = async () => {
    if (!user?.id || !userId || !friendshipStatus?.friendshipId) return;

    const { error } = await friendsService.declineFriendRequest(user.id, friendshipStatus.friendshipId);
    if (error) {
      console.error('Error declining friend request:', error);
      return;
    }

    await loadFriendshipStatus();
  };

  const getStatusButton = () => {
    if (!friendshipStatus || friendshipStatus.status === 'self') {
      return null;
    }

    if (friendshipStatus.status === 'accepted') {
      return (
        <TouchableOpacity
          style={styles.statusButton}
          onPress={handleRemoveFriend}
        >
          <Text style={styles.statusButtonText}>Remove</Text>
        </TouchableOpacity>
      );
    }

    if (friendshipStatus.status === 'pending') {
      if (friendshipStatus.isIncoming) {
        // Show both Accept and Decline buttons
        return (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.declineButton]}
              onPress={handleDeclineRequest}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { marginLeft: 8 }]}
              onPress={handleAcceptRequest}
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
            onPress={handleCancelRequest}
          >
            <Text style={styles.cancelButtonText}>Cancel Request</Text>
          </TouchableOpacity>
        );
      }
    }

    // status === 'none'
    return (
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleSendRequest}
      >
        <Ionicons name="person-add-outline" size={16} color="#1D1D1F" />
        <Text style={[styles.actionButtonText, { marginLeft: 4 }]}>Add</Text>
      </TouchableOpacity>
    );
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

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.modalOverlay}>
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            activeOpacity={1}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.modalContent,
            animatedSheetStyle,
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="chevron-down" size={24} color="#1D1D1F" />
            </TouchableOpacity>
            <View style={styles.headerRight}>
              {getStatusButton()}
            </View>
          </View>

          {/* Content */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
          ) : !profile ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.errorText}>Profile not found</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.content}
              contentContainerStyle={{ paddingBottom: insets.bottom }}
              showsVerticalScrollIndicator={false}
            >
              {profile && (
                <ProfileContent
                  userId={userId}
                  profile={profile}
                  loading={loading}
                />
              )}
            </ScrollView>
          )}
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 1999,
  },
  modalContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 2000,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  closeButton: {
    padding: 4,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1D1D1F",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1D1D1F",
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF",
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1D1D1F",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF",
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1D1D1F",
  },
  declineButton: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  declineButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1D1D1F",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#8E8E93",
  },
  content: {
    flex: 1,
  },
});

