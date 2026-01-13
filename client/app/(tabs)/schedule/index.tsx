import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence } from 'react-native-reanimated';
import SafeAreaWrapper from '../../../components/common/SafeAreaWrapper';
import { useAuth } from '../../../context/AuthContext';
import { spacedRepetitionService } from '../../../services/spacedRepetitionService';
import { useSpacedRepetitionConfig } from '../../../context/SpacedRepetitionConfigContext';
import ConsistencyGraph from '../../../components/schedule/ConsistencyGraph';
import NewQueueModal from '../../../components/schedule/NewQueueModal';
import ReviewQueueModal from '../../../components/schedule/ReviewQueueModal';

interface QueueStats {
  newCards: number;
  dueCards: number;
  totalScheduled: number;
  newCardsLeftToday: number;
  cardsDueToday: number;
  streak: number;
}

// Animated number component for smooth transitions
function AnimatedNumber({ value, children, style }: { value: number; children?: React.ReactNode; style?: any }) {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      // Fade out and scale down, then fade in and scale up
      opacity.value = withSequence(
        withTiming(0.3, { duration: 150 }),
        withTiming(1, { duration: 200 })
      );
      scale.value = withSequence(
        withTiming(0.9, { duration: 150 }),
        withTiming(1, { duration: 200 })
      );
      prevValue.current = value;
    }
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.Text style={[style, animatedStyle]}>
      {value}
      {children}
    </Animated.Text>
  );
}

export default function ScheduleScreen() {
  const { user } = useAuth();
  const { showSpacedRepetitionConfig } = useSpacedRepetitionConfig();
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true); // Only true on initial load
  const [refreshing, setRefreshing] = useState(false); // For pull-to-refresh
  const [error, setError] = useState<string | null>(null);
  const [showNewQueueModal, setShowNewQueueModal] = useState(false);
  const [showReviewQueueModal, setShowReviewQueueModal] = useState(false);

  const loadQueueStats = useCallback(async (isRefresh: boolean = false) => {
    if (!user?.id) return;

    // Only show loading spinner on initial load
    if (!isRefresh) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);

    try {
      const { data, error: statsError } = await spacedRepetitionService.getQueueStats(user.id);
      
      if (statsError) {
        setError(statsError.message || 'Failed to load queue stats');
        return;
      }

      if (data) {
        setQueueStats(data);
        // Graph will refresh automatically via its own useFocusEffect
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error loading queue stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  // Track if we have initial data to avoid refreshing on initial load
  const hasInitialData = useRef(false);

  // Load stats when user changes (initial load only)
  useEffect(() => {
    if (user?.id && !queueStats) {
      loadQueueStats(false);
    }
  }, [user?.id, queueStats, loadQueueStats]);

  // Track when we have initial data loaded
  useEffect(() => {
    if (queueStats && !loading) {
      hasInitialData.current = true;
    }
  }, [queueStats, loading]);

  // Refresh stats when screen comes into focus (stale-while-revalidate)
  // Only refresh once per focus, not when queueStats changes
  useFocusEffect(
    useCallback(() => {
      if (user?.id && hasInitialData.current) {
        // Only refresh if we already have data (stale-while-revalidate)
        loadQueueStats(true);
      }
    }, [user?.id, loadQueueStats]) // Removed queueStats from deps to prevent loop
  );

  const handleRefresh = useCallback(() => {
    if (user?.id) {
      loadQueueStats(true);
    }
  }, [user?.id]);

  const totalCardsForSession = queueStats 
    ? Math.min(queueStats.newCardsLeftToday, queueStats.newCards) + queueStats.cardsDueToday 
    : 0;

  const handleStartQuizitSession = useCallback(() => {
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to start a session');
      return;
    }

    // Check if there are any cards available
    if (totalCardsForSession === 0) {
      Alert.alert(
        'No Cards Available',
        'You don\'t have any cards available for review right now. Check back later!'
      );
      return;
    }

    // Show configuration modal
    showSpacedRepetitionConfig();
  }, [user?.id, totalCardsForSession, showSpacedRepetitionConfig]);

  return (
    <SafeAreaWrapper backgroundColor="white">
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#636366"
            colors={['#636366']}
          />
        }
      >
        {loading && !queueStats ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#636366" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            {/* Consistency Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Consistency</Text>
                <View style={styles.headerRight}>
                  {queueStats ? (
                    <AnimatedNumber value={queueStats.streak} style={styles.streakText}>
                      {' '}Day Streak
                    </AnimatedNumber>
                  ) : (
                    <Text style={styles.streakText}>0 Day Streak</Text>
                  )}
                </View>
              </View>
              <View style={styles.consistencyGraph}>
                {user?.id && <ConsistencyGraph userId={user.id} />}
              </View>
            </View>

            {/* Review Queue Section */}
            <TouchableOpacity 
              style={styles.section}
              onPress={() => setShowReviewQueueModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Review Queue</Text>
                <View style={styles.headerRight}>
                  {queueStats ? (
                    <AnimatedNumber value={queueStats.totalScheduled} style={styles.countText}>
                      {' '}Cards
                    </AnimatedNumber>
                  ) : (
                    <Text style={styles.countText}>0 Cards</Text>
                  )}
                </View>
              </View>
              <View style={styles.sectionContent}>
                {queueStats && queueStats.cardsDueToday > 0 ? (
                  <>
                    <AnimatedNumber value={queueStats.cardsDueToday} style={styles.largeNumber} />
                    <Text style={styles.queueLabel}>cards left today</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.largeNumber}>0</Text>
                    <Text style={styles.queueLabel}>cards left today</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>

            {/* New Card Queue Section */}
            <TouchableOpacity 
              style={styles.section}
              onPress={() => setShowNewQueueModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>New Queue</Text>
                <View style={styles.headerRight}>
                  {queueStats ? (
                    <AnimatedNumber value={queueStats.newCards} style={styles.countText}>
                      {' '}Cards
                    </AnimatedNumber>
                  ) : (
                    <Text style={styles.countText}>0 New Cards</Text>
                  )}
                </View>
              </View>
              <View style={styles.sectionContent}>
                {queueStats ? (
                  <>
                    <AnimatedNumber 
                      value={Math.min(queueStats.newCardsLeftToday, queueStats.newCards)} 
                      style={styles.largeNumber}
                    />
                    <Text style={styles.queueLabel}>cards left today</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.largeNumber}>0</Text>
                    <Text style={styles.queueLabel}>cards left today</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Start Quizit Session Button */}
      {queueStats && !error && (
        <TouchableOpacity 
          style={styles.startQuizitButton}
          onPress={handleStartQuizitSession}
          activeOpacity={0.85}
          disabled={totalCardsForSession === 0}
        >
          <Text style={styles.startQuizitText}>
            Start Quizit{'\n'}Session
          </Text>
          <View style={styles.startQuizitButtonCircle}>
            <AnimatedNumber value={totalCardsForSession} style={styles.circleText} />
          </View>
        </TouchableOpacity>
      )}

      {/* New Queue Modal */}
      <NewQueueModal
        visible={showNewQueueModal}
        onClose={() => setShowNewQueueModal(false)}
        onRefresh={() => loadQueueStats(true)}
      />

      {/* Review Queue Modal */}
      <ReviewQueueModal
        visible={showReviewQueueModal}
        onClose={() => setShowReviewQueueModal(false)}
        onRefresh={() => loadQueueStats(true)}
      />
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    paddingBottom: 100, // Space for button
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  streakText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#636366',
  },
  countText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#636366',
  },
  consistencyGraph: {
    minHeight: 120,
    width: '100%',
  },
  sectionContent: {
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1D1D1F',
    textAlign: 'center',
  },
  queueLabel: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
  startQuizitButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    padding: 6,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 100,
    opacity: 0.9,
  },
  startQuizitButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#636366',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  circleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  startQuizitText: {
    color: '#636366',
    fontSize: 11,
    textAlign: 'right',
    lineHeight: 13,
    fontWeight: '500',
    paddingLeft: 8,
  },
});
