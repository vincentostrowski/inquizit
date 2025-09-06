import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SkeletonText from './SkeletonText';

interface SkeletonCardProps {
  size: 'small' | 'medium' | 'large';
}

export default function SkeletonCard({ size }: SkeletonCardProps) {
  const getSizeStyles = (size: 'small' | 'medium' | 'large') => {
    const sizes = {
      small: {
        container: {
          height: 184,
          width: 138,
          padding: 8,
          marginRight: 12,
          borderRadius: 8,
        },
        coverContainer: {
          height: 48,
          borderRadius: 6,
          marginBottom: 8,
        },
        title: {
          height: 12,
          marginBottom: 4,
        },
        description: {
          height: 10,
          lines: 2,
        },
        badge: {
          width: 40,
          height: 16,
          borderRadius: 8,
          bottom: 4,
          right: 4,
        },
        badgeText: {
          fontSize: 6,
          paddingHorizontal: 6,
          paddingVertical: 2,
        },
      },
      medium: {
        container: {
          height: 240,
          width: 180,
          padding: 10,
          marginRight: 16,
          borderRadius: 10,
        },
        coverContainer: {
          height: 64,
          borderRadius: 8,
          marginBottom: 10,
        },
        title: {
          height: 16,
          marginBottom: 5,
        },
        description: {
          height: 12,
          lines: 2,
        },
        badge: {
          width: 50,
          height: 20,
          borderRadius: 10,
          bottom: 5,
          right: 5,
        },
        badgeText: {
          fontSize: 8,
          paddingHorizontal: 8,
          paddingVertical: 3,
        },
      },
      large: {
        container: {
          height: 320,
          width: 240,
          padding: 14,
          alignSelf: 'center',
          borderRadius: 14,
        },
        coverContainer: {
          height: 80,
          borderRadius: 11,
          marginBottom: 14,
        },
        title: {
          height: 20,
          marginBottom: 7,
        },
        description: {
          height: 14,
          lines: 3,
        },
        badge: {
          width: 60,
          height: 24,
          borderRadius: 12,
          bottom: 7,
          right: 7,
        },
        badgeText: {
          fontSize: 10,
          paddingHorizontal: 10,
          paddingVertical: 3,
        },
      },
    };
    
    return sizes[size];
  };

  const sizeStyles = getSizeStyles(size);

  return (
    <View style={[styles.container, sizeStyles.container]}>
      {/* Cover Image Skeleton */}
      <View style={[styles.coverContainer, sizeStyles.coverContainer]}>
        <SkeletonText 
          width="100%" 
          height="100%" 
          borderRadius={sizeStyles.coverContainer.borderRadius}
        />
      </View>
      
      {/* Title Skeleton */}
      <SkeletonText 
        width="90%" 
        height={sizeStyles.title.height}
        borderRadius={4}
      />
      
      {/* Description Skeleton */}
      <SkeletonText 
        width="100%" 
        height={sizeStyles.description.height}
        lines={sizeStyles.description.lines}
        spacing={4}
        borderRadius={4}
      />
      
      {/* Inquizit Badge - Static text like real Card */}
      <View style={[styles.badgeContainer, { bottom: sizeStyles.badge.bottom, right: sizeStyles.badge.right }]}>
        <Text style={[styles.badgeText, sizeStyles.badgeText]}>Inquizit</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF7ED', // orange-50
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray-200
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  coverContainer: {
    backgroundColor: '#D1D5DB', // gray-200
    overflow: 'hidden',
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    overflow: 'hidden',
  },
  badgeText: {
    fontWeight: '400',
    color: '#6B7280',
  },
});
