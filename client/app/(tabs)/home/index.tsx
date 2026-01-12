import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SafeAreaWrapper from '../../../components/common/SafeAreaWrapper';
import { useAuth } from '../../../context/AuthContext';
import { notificationService } from '../../../services/notificationService';
import InquizitTab from '../../../components/home/InquizitTab';
import FriendsTab from '../../../components/home/FriendsTab';
import DiscoverTab from '../../../components/home/DiscoverTab';
import UserSearchModal from '../../../components/friends/UserSearchModal';
import NotificationsModal from '../../../components/notifications/NotificationsModal';

type TabType = 'inquizit' | 'friends' | 'discover';

export default function HomeScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('inquizit');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadUnreadCount();
    }
  }, [user?.id]);

  const loadUnreadCount = async () => {
    if (!user?.id) return;
    const { data, error } = await notificationService.getUnreadNotificationCount(user.id);
    if (!error && data !== null) {
      setUnreadCount(data);
    }
  };

  return (
    <SafeAreaWrapper backgroundColor="white">
      {/* Top Tab Navigation */}
      <View style={styles.tabBar}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'inquizit' && styles.activeTab]}
            onPress={() => setActiveTab('inquizit')}
          >
            <Text style={[styles.tabText, activeTab === 'inquizit' && styles.activeTabText]}>
              Inquizit
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
            onPress={() => setActiveTab('friends')}
          >
            <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
              Friends
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
            onPress={() => setActiveTab('discover')}
          >
            <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>
              Discover
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notifications Bell */}
        <TouchableOpacity
          style={styles.bellContainer}
          onPress={() => setShowNotifications(true)}
        >
          <Ionicons name="notifications-outline" size={24} color="#1D1D1F" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <ScrollView style={styles.container}>
        {activeTab === 'inquizit' && <InquizitTab />}
        {activeTab === 'friends' && <FriendsTab />}
        {activeTab === 'discover' && <DiscoverTab />}
      </ScrollView>

      {/* Search Button - Only visible on Friends tab */}
      {activeTab === 'friends' && (
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setShowUserSearch(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* User Search Modal */}
      <UserSearchModal
        visible={showUserSearch}
        onClose={() => setShowUserSearch(false)}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        onNotificationRead={loadUnreadCount}
      />
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  activeTab: {
    backgroundColor: '#F5F5DC', // Beige/light background
    borderRadius: 20,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93', // Gray for inactive
  },
  activeTabText: {
    color: '#1D1D1F', // Black for active
    fontWeight: '600',
  },
  bellContainer: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
