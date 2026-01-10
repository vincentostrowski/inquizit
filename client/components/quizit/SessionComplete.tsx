import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SessionStats {
  totalCards: number;
  newCardsReviewed: number;
  reviewCardsReviewed: number;
}

interface SessionCompleteProps {
  stats: SessionStats;
}

export default function SessionComplete({ stats }: SessionCompleteProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Fade in and scale up animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.card, 
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Checkmark Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={48} color="#ffffff" />
          </View>
        </View>

        {/* Congratulations Message */}
        <Text style={styles.title}>Congratulations!</Text>
        <Text style={styles.subtitle}>You completed today's review</Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statText}>
            {stats.totalCards} card{stats.totalCards !== 1 ? 's' : ''} reviewed
          </Text>
          
          {stats.newCardsReviewed > 0 && (
            <Text style={styles.statText}>
              {stats.newCardsReviewed} new card{stats.newCardsReviewed !== 1 ? 's' : ''} learned
            </Text>
          )}
          
          {stats.reviewCardsReviewed > 0 && (
            <Text style={styles.statText}>
              {stats.reviewCardsReviewed} card{stats.reviewCardsReviewed !== 1 ? 's' : ''} reinforced
            </Text>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1D1D1F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#8E8E93',
    marginBottom: 32,
    textAlign: 'center',
  },
  statsContainer: {
    width: '100%',
    marginBottom: 32,
    gap: 6,
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8E8E93',
    textAlign: 'center',
  },
});

