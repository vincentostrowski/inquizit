import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MiniCardIcon from '../book/MiniCardIcon';

interface CardComponentProps {
  title: string;
  isBookmarked?: boolean;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  isSelected?: boolean;
}

export default function CardComponent({ title, isBookmarked = false, onPress, size = 'medium', isSelected = false }: CardComponentProps) {
  const sizeStyles = getSizeStyles(size);
  
  return (
    <TouchableOpacity 
      style={[styles.container, sizeStyles.container]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftContainer}>
        {/* Card Icon with Selection Indicator */}
        <View style={[styles.cardIcon, sizeStyles.cardIcon]}>
          <MiniCardIcon size={sizeStyles.iconSize} />
          {/* Selection Overlay - Only on the mini card icon */}
          {isSelected && (
            <View style={[styles.selectionOverlay, sizeStyles.cardIcon]}>
              <View style={[styles.checkmarkContainer, sizeStyles.checkmarkContainer]}>
                <Ionicons 
                  name="checkmark" 
                  size={sizeStyles.checkmarkSize} 
                  color="white" 
                />
              </View>
            </View>
          )}
        </View>
        {/* Card Title */}
        <Text style={[styles.title, sizeStyles.title]}>{title}</Text>
      </View>
      
      {/* Bookmark Icon */}
      {isBookmarked && (
        <View style={[styles.bookmarkContainer, sizeStyles.bookmarkContainer]}>
          <Ionicons 
            name="bookmark" 
            size={sizeStyles.bookmarkSize} 
            color="#8E8E93" 
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

const getSizeStyles = (size: 'small' | 'medium' | 'large') => {
  const sizes = {
    small: {
      container: {
        paddingVertical: 12,
        paddingHorizontal: 16,
      },
      cardIcon: {
        width: 24,
        height: 24,
        marginRight: 6,
      },
      iconSize: 20,
      checkmarkSize: 12,
      checkmarkContainer: {
        width: 16,
        height: 16,
        borderRadius: 8,
      },
      title: {
        fontSize: 12,
        lineHeight: 16,
      },
      bookmarkContainer: {
        marginLeft: 8,
      },
      bookmarkSize: 14,
    },
    medium: {
      container: {
        paddingVertical: 12,
        paddingLeft: 10,
        paddingRight: 17,
      },
      cardIcon: {
        width: 32,
        height: 32,
        marginRight: 12,
      },
      iconSize: 28,
      checkmarkSize: 14,
      checkmarkContainer: {
        width: 18,
        height: 18,
        borderRadius: 9,
      },
      title: {
        fontSize: 14,
        lineHeight: 20,
      },
      bookmarkContainer: {
        marginLeft: 12,
      },
      bookmarkSize: 16,
    },
    large: {
      container: {
        paddingVertical: 16,
        paddingHorizontal: 20,
      },
      cardIcon: {
        width: 36,
        height: 36,
        marginRight: 16,
      },
      iconSize: 32,
      checkmarkSize: 16,
      checkmarkContainer: {
        width: 20,
        height: 20,
        borderRadius: 10,
      },
      title: {
        fontSize: 16,
        lineHeight: 22,
      },
      bookmarkContainer: {
        marginLeft: 16,
      },
      bookmarkSize: 18,
    },
  };
  
  return sizes[size];
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: '400',
    color: '#1D1D1F',
    flex: 1,
  },
  bookmarkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkContainer: {
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
