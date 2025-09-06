import React from 'react';
import { View, StyleSheet } from 'react-native';
import GradientBackground from '../common/GradientBackground';
import SkeletonText from '../common/SkeletonText';

interface SkeletonCoverDisplayProps {
  headerColor?: string;
  backgroundEndColor?: string;
}

export default function SkeletonCoverDisplay({ 
  headerColor = '#FF3B30',
  backgroundEndColor = '#8B0000'
}: SkeletonCoverDisplayProps) {
  const sizeStyles = {
    default: { width: 152, height: 208 }
  };

  const currentSize = sizeStyles.default;

  const renderSkeletonCard = (index: number, zIndex: number) => (
    <View
      key={`skeleton-card-${index}`}
      style={[
        styles.cardContainer,
        currentSize,
        { left: 16 + (index * 16), zIndex }
      ]}
    >
      <SkeletonText 
        width="100%" 
        height={52}
        borderRadius={8}
      />
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
      <View style={styles.coverSection}>
        <View style={styles.overlappingCardsContainer}>
          <View style={[styles.overlapContainer, { width: currentSize.width + 48 }]}>
            {/* Three overlapping skeleton cards */}
            {renderSkeletonCard(0, 20)}
            {renderSkeletonCard(1, 10)}
            {renderSkeletonCard(2, 0)}

            {/* Book cover skeleton */}
            <View style={[styles.bookCoverSkeleton, currentSize]}>
              <SkeletonText 
                width="100%" 
                height="100%"
                borderRadius={12}
              />
            </View>
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
  coverSection: {
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
  },
  cardContainer: {
    position: 'absolute',
    top: 0,
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    opacity: 1,
  },
  bookCoverSkeleton: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 30,
    opacity: 1,
  },
});
