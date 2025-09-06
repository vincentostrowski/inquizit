import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';

export default function SkeletonListDisplay() {
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

  const SkeletonSectionComponent = ({ isExpanded = false }: { isExpanded?: boolean }) => (
    <View style={styles.sectionContainer}>
      <View style={isExpanded ? styles.expandedContainer : styles.collapsedContainer}>
        {/* Section Title */}
        <View style={[styles.titleSkeleton, { width: 100, height: 12 }]}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
        
        <View style={styles.rightContainer}>
          {/* Progress Bar Skeleton */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarSkeleton, { width: '60%' }]}>
              <Animated.View style={[styles.shimmer, shimmerStyle]} />
            </View>
          </View>
          
          {/* Triangle Skeleton */}
          <View style={styles.triangleContainer}>
            <View style={styles.triangleSkeleton}>
              <Animated.View style={[styles.shimmer, shimmerStyle]} />
            </View>
          </View>
        </View>
      </View>
      
      {/* Cards Container (only if expanded) */}
      {isExpanded && (
        <View style={styles.cardsContainer}>
          {Array.from({ length: 3 }, (_, index) => (
            <View key={index} style={styles.cardSkeleton}>
              <View style={styles.cardIconSkeleton}>
                <Animated.View style={[styles.shimmer, shimmerStyle]} />
              </View>
              <View style={styles.cardContentSkeleton}>
                <View style={[styles.cardTitleSkeleton, { width: '80%', height: 12, marginBottom: 4 }]}>
                  <Animated.View style={[styles.shimmer, shimmerStyle]} />
                </View>
                <View style={[styles.cardDescriptionSkeleton, { width: '60%', height: 10 }]}>
                  <Animated.View style={[styles.shimmer, shimmerStyle]} />
                </View>
              </View>
              <View style={styles.bookmarkSkeleton}>
                <Animated.View style={[styles.shimmer, shimmerStyle]} />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionsContainer}>
        <SkeletonSectionComponent isExpanded={false} />
        <SkeletonSectionComponent isExpanded={false} />
        <SkeletonSectionComponent isExpanded={false} />
        <SkeletonSectionComponent isExpanded={false} />
        <SkeletonSectionComponent isExpanded={false} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 8,
  },
  sectionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionContainer: {
    marginBottom: 12,
  },
  // Collapsed Container - Simple rounded container
  collapsedContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Expanded Container - Contains header and cards
  expandedContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    overflow: 'hidden',
  },
  titleSkeleton: {
    backgroundColor: 'white',
    overflow: 'hidden',
    position: 'relative',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarContainer: {
    width: 32,
    height: 2,
    backgroundColor: '#D1D1D6',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBarSkeleton: {
    height: '100%',
    backgroundColor: 'white',
    overflow: 'hidden',
    position: 'relative',
  },
  triangleContainer: {
    padding: 8,
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  triangleSkeleton: {
    width: 12,
    height: 8,
    backgroundColor: 'white',
    overflow: 'hidden',
    position: 'relative',
  },
  cardsContainer: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  cardSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  cardIconSkeleton: {
    width: 24,
    height: 24,
    backgroundColor: 'white',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  cardContentSkeleton: {
    flex: 1,
  },
  cardTitleSkeleton: {
    backgroundColor: 'white',
    overflow: 'hidden',
    position: 'relative',
  },
  cardDescriptionSkeleton: {
    backgroundColor: 'white',
    overflow: 'hidden',
    position: 'relative',
  },
  bookmarkSkeleton: {
    width: 14,
    height: 14,
    backgroundColor: 'white',
    borderRadius: 2,
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
