import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import SkeletonCard from '../common/SkeletonCard';

export default function SkeletonCardDisplay() {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startShimmer = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(shimmerAnimation, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };

    startShimmer();
  }, [shimmerAnimation]);

  const shimmerStyle = {
    transform: [
      {
        translateX: shimmerAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [-100, 100],
        }),
      },
    ],
  };

  const SkeletonCardRow = ({ titleWidth }: { titleWidth: number }) => (
    <View style={styles.container}>
      {/* Section Title - Exact match to CardRow */}
      <View style={styles.titleContainer}>
        <View style={[styles.titleSkeleton, { width: titleWidth, height: 20 }]}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
      </View>
      
      {/* Horizontal Scroll of Cards - Exact match to CardRow */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {Array.from({ length: 5 }, (_, index) => (
          <SkeletonCard key={index} size="small" />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View>
      <SkeletonCardRow titleWidth={140} />
      <SkeletonCardRow titleWidth={120} />
      <SkeletonCardRow titleWidth={160} />
      <SkeletonCardRow titleWidth={100} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginBottom: 6,
  },
  titleSkeleton: {
    backgroundColor: 'white',
    overflow: 'hidden',
    position: 'relative',
  },
  scrollContent: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingBottom: 36,
    gap: 8,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F3F4F6', // gray-100
    opacity: 0.6,
  },
});
