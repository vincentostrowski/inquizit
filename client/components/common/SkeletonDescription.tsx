import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export default function SkeletonDescription() {
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
      {/* First line - full width */}
      <View style={[styles.line, { width: '100%', height: 20, marginBottom: 4 }]}>
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
      </View>
      
      {/* Second line - full width */}
      <View style={[styles.line, { width: '100%', height: 20, marginBottom: 4 }]}>
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
      </View>
      
      {/* Third line - full width */}
      <View style={[styles.line, { width: '100%', height: 20, marginBottom: 4 }]}>
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
      </View>
      
      {/* Fourth line - shorter (75% width) */}
      <View style={[styles.line, { width: '75%', height: 20 }]}>
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 26,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  line: {
    backgroundColor: 'white',
    overflow: 'hidden',
    position: 'relative',
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
