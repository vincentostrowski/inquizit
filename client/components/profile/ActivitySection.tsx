import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActivityItem {
  id: string;
  type: 'review' | 'streak' | 'expert' | 'milestone';
  title: string;
  subtitle: string;
  timestamp: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

// Mock data for styling
const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: '1',
    type: 'expert',
    title: 'Became an Expert',
    subtitle: 'Atomic Habits',
    timestamp: '2 days ago',
    icon: 'trophy',
    iconColor: '#F59E0B',
  },
  {
    id: '2',
    type: 'streak',
    title: '7 Day Streak',
    subtitle: 'Keep it up!',
    timestamp: '3 days ago',
    icon: 'flame',
    iconColor: '#EF4444',
  },
  {
    id: '3',
    type: 'milestone',
    title: '100 Cards Reviewed',
    subtitle: 'Milestone reached',
    timestamp: '1 week ago',
    icon: 'star',
    iconColor: '#8B5CF6',
  },
  {
    id: '4',
    type: 'expert',
    title: 'Became an Expert',
    subtitle: 'Zero to One',
    timestamp: '2 weeks ago',
    icon: 'trophy',
    iconColor: '#F59E0B',
  },
];

interface ActivitySectionProps {
  userId: string;
}

export default function ActivitySection({ userId }: ActivitySectionProps) {
  // Using mock data for now
  const activities = MOCK_ACTIVITY;

  if (activities.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <View style={styles.headerLine} />
      </View>

      <View style={styles.activityList}>
        {activities.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={[styles.iconContainer, { backgroundColor: activity.iconColor + '15' }]}>
              <Ionicons name={activity.icon} size={16} color={activity.iconColor} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
            </View>
            <Text style={styles.activityTimestamp}>{activity.timestamp}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
    marginRight: 12,
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  activitySubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#8E8E93',
    marginTop: 1,
  },
  activityTimestamp: {
    fontSize: 11,
    fontWeight: '400',
    color: '#C7C7CC',
  },
});

