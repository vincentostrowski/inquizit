import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import GradientBackground from '../common/GradientBackground';
import SkeletonCard from '../common/SkeletonCard';

interface SkeletonSectionDisplayProps {
  headerColor?: string;
  backgroundEndColor?: string;
}

export default function SkeletonSectionDisplay({ 
  headerColor = '#FF3B30',
  backgroundEndColor = '#8B0000'
}: SkeletonSectionDisplayProps) {
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

  const renderSkeletonCard = (index: number, zIndex: number) => (
    <View
      key={`skeleton-card-${index}`}
      style={[
        styles.cardContainer,
        { left: 16 + (index * 16), zIndex }
      ]}
    >
      <SkeletonCard size="small" />
    </View>
  );

  return (
    <View style={styles.container}>
      <GradientBackground
        headerColor={headerColor}
        backgroundEndColor={backgroundEndColor}
        height={208}
        borderRadius={50} // 15% of 208px ≈ 30px
      />
      <View style={styles.sectionContent}>
        <View style={styles.overlappingCardsContainer}>
          <View style={styles.overlapContainer}>
            {/* Three overlapping skeleton cards */}
            {renderSkeletonCard(0, 20)}
            {renderSkeletonCard(1, 10)}
            {renderSkeletonCard(2, 0)}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: 'white',
  },
  sectionContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
    zIndex: 1,
  },
  overlappingCardsContainer: {
    height: 208,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlapContainer: {
    position: 'relative',
    height: '100%',
    width: 200, // Fixed width to accommodate 3 overlapping cards
  },
  cardContainer: {
    position: 'absolute',
    top: 0,
  },
});
