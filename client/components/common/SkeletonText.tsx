import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SkeletonTextProps {
  width: number | string;
  height: number;
  lines?: number;
  spacing?: number;
  borderRadius?: number;
}

export default function SkeletonText({ 
  width, 
  height, 
  lines = 1, 
  spacing = 4, 
  borderRadius = 4 
}: SkeletonTextProps) {
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

  if (lines === 1) {
    return (
      <View style={[styles.container, { width, height, borderRadius }]}>
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
      </View>
    );
  }

  return (
    <View style={styles.multiLineContainer}>
      {Array.from({ length: lines }, (_, index) => (
        <View
          key={index}
          style={[
            styles.container,
            { 
              width: index === lines - 1 ? '75%' : width, // Last line shorter
              height, 
              borderRadius,
              marginBottom: index < lines - 1 ? spacing : 0
            }
          ]}
        >
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    overflow: 'hidden',
    position: 'relative',
  },
  multiLineContainer: {
    flexDirection: 'column',
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
