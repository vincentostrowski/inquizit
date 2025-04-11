import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Dimensions } from 'react-native';

export default function RightLoadingAnimation() {
  const opacity = useRef(new Animated.Value(0.5)).current; // Start with 50% opacity

  useEffect(() => {
    // Create a pulsing animation
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1, // Fully visible
          duration: 800, // Duration of fade-in
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3, // Fade out to 30% opacity
          duration: 800, // Duration of fade-out
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    // Cleanup animation on unmount
    return () => animation.stop();
  }, [opacity]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.pulsingBar,
          { opacity }, // Apply the animated opacity
        ]}
      />
    </View>
  );
}

const { height } = Dimensions.get('window'); // Get the screen height dynamically

const styles = StyleSheet.create({
  container: {
    position: 'absolute', // Position relative to the screen
    right: 0, // Align to the right side of the screen
    top: 0, // Start at the top of the screen
    height: height, // Full screen height
    width: 10, // Fixed width for the bar
    zIndex: 1000, // Ensure it appears above other content
  },
  pulsingBar: {
    flex: 1,
    backgroundColor: '#4CAF50', // Subtle green color
  },
});