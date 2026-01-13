import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import SkeletonText from '../common/SkeletonText';

export default function SkeletonBookRowItem() {
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

  return (
    <View style={styles.container}>
      {/* Book Cover Skeleton - matches BookRowItem dimensions */}
      <View style={styles.bookCover}>
        <SkeletonText 
          width="100%" 
          height={140}
          borderRadius={8}
        />
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
      </View>
      
      {/* Book Title Skeleton - matches BookRowItem title */}
      <View style={styles.bookTitleContainer}>
        <SkeletonText 
          width="90%" 
          height={14}
          borderRadius={4}
        />
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    marginRight: 12,
  },
  bookCover: {
    width: 100,
    height: 140,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    overflow: 'hidden',
    position: 'relative',
  },
  bookTitleContainer: {
    marginTop: 4,
    width: 100,
    height: 32, // Fixed height to match BookRowItem title height
    overflow: 'hidden',
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
  },
});
