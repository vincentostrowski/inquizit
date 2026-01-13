import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export default function SkeletonContent() {
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
      <View style={styles.contentContainer}>
        {/* Multiple lines of content text skeleton */}
        <View style={[styles.line, { width: '100%', height: 16, marginBottom: 8 }]}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
        <View style={[styles.line, { width: '100%', height: 16, marginBottom: 8 }]}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
        <View style={[styles.line, { width: '100%', height: 16, marginBottom: 8 }]}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
        <View style={[styles.line, { width: '100%', height: 16, marginBottom: 8 }]}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
        <View style={[styles.line, { width: '100%', height: 16, marginBottom: 8 }]}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
        <View style={[styles.line, { width: '100%', height: 16, marginBottom: 8 }]}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
        <View style={[styles.line, { width: '100%', height: 16, marginBottom: 8 }]}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
        <View style={[styles.line, { width: '100%', height: 16, marginBottom: 8 }]}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
        <View style={[styles.line, { width: '100%', height: 16, marginBottom: 8 }]}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
        <View style={[styles.line, { width: '100%', height: 16, marginBottom: 8 }]}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
        <View style={[styles.line, { width: '100%', height: 16, marginBottom: 8 }]}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
        <View style={[styles.line, { width: '85%', height: 16 }]}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 14,
  },
  contentContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  line: {
    backgroundColor: 'white',
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 4,
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
