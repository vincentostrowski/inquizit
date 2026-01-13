import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';

export default function SkeletonSectionListDisplay() {
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

  const SkeletonCardComponent = ({ titleWidth, hasBookmark = false }: { titleWidth: number; hasBookmark?: boolean }) => (
    <View style={styles.cardContainer}>
      <View style={styles.leftContainer}>
        {/* Card Icon Skeleton */}
        <View style={styles.cardIconSkeleton}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
        
        {/* Card Title Skeleton */}
        <View style={[styles.cardTitleSkeleton, { width: titleWidth, height: 14 }]}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
      </View>
      
      {/* Bookmark Skeleton - Only show if hasBookmark is true */}
      {hasBookmark && (
        <View style={styles.bookmarkSkeleton}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.cardsContainer}>
        <SkeletonCardComponent titleWidth={120} hasBookmark={false} />
        <SkeletonCardComponent titleWidth={90} hasBookmark={true} />
        <SkeletonCardComponent titleWidth={140} hasBookmark={true} />
        <SkeletonCardComponent titleWidth={110} hasBookmark={true} />
        <SkeletonCardComponent titleWidth={100} hasBookmark={true} />
        <SkeletonCardComponent titleWidth={130} hasBookmark={true} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  cardsContainer: {
    paddingHorizontal: 10,
    paddingBottom: 24,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingLeft: 10,
    paddingRight: 17,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIconSkeleton: {
    width: 32,
    height: 32,
    backgroundColor: 'white',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitleSkeleton: {
    backgroundColor: 'white',
    overflow: 'hidden',
    position: 'relative',
    flex: 1,
  },
  bookmarkSkeleton: {
    width: 16,
    height: 16,
    backgroundColor: 'white',
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
