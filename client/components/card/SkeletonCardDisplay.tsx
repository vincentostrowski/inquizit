import React from 'react';
import { View, StyleSheet } from 'react-native';
import GradientBackground from '../common/GradientBackground';
import SkeletonCard from '../common/SkeletonCard';

interface SkeletonCardDisplayProps {
  headerColor?: string;
  backgroundEndColor?: string;
}

export default function SkeletonCardDisplay({
  headerColor = '#1D1D1F',
  backgroundEndColor = '#1E40AF'
}: SkeletonCardDisplayProps) {
  return (
    <View style={styles.container}>
      <GradientBackground
        headerColor={headerColor}
        backgroundEndColor={backgroundEndColor}
        height={208}
        borderRadius={50} // 15% of 208px ≈ 30px
      />
      
      <View style={styles.cardSection}>
        <SkeletonCard size="large" />
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
  cardSection: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
    zIndex: 1,
  },
});
