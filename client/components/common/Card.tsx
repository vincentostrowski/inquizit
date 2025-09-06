import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface CardProps {
  title: string;
  description: string;
  banner?: string;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export default function Card({ title, description, banner, onPress, size = 'medium' }: CardProps) {
  const sizeStyles = getSizeStyles(size);
  
  return (
    <TouchableOpacity 
      style={[styles.container, sizeStyles.container]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Cover Image */}
      <View style={[styles.coverContainer, sizeStyles.coverContainer]}>
        {banner && banner.trim() !== '' ? (
          <Image 
            source={{ uri: banner }} 
            style={styles.coverImage}
            resizeMode="cover"
            onError={(error) => console.log('Image load error:', error)}
            onLoad={() => console.log('Image loaded successfully')}
          />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Text style={[styles.placeholderIcon, sizeStyles.placeholderIcon]}>📚</Text>
          </View>
        )}
      </View>
      
      {/* Title */}
      <Text style={[styles.title, sizeStyles.title]} numberOfLines={2}>
        {title}
      </Text>
      
      {/* Description */}
      <Text style={[styles.description, sizeStyles.description]} numberOfLines={7}>
        {description}
      </Text>
      
      {/* Inquizit Badge */}
      <View style={[styles.badgeContainer, sizeStyles.badgeContainer]}>
        <Text style={[styles.badgeText, sizeStyles.badgeText]}>Inquizit</Text>
      </View>
    </TouchableOpacity>
  );
}

const getSizeStyles = (size: 'small' | 'medium' | 'large') => {
  const sizes = {
    small: {
      container: {
        height: 184,
        width: 138, // 0.75 ratio (184 * 0.75 = 138)
        padding: 8,
        marginRight: 12,
        borderRadius: 8,
      },
      coverContainer: {
        height: 48,
        borderRadius: 6,
        marginBottom: 8,
      },
      placeholderIcon: {
        fontSize: 12,
      },
      title: {
        fontSize: 10,
        marginBottom: 4,
        lineHeight: 12,
      },
      description: {
        fontSize: 8,
        lineHeight: 10,
      },
      badgeContainer: {
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
        width: 180, // 0.75 ratio (240 * 0.75 = 180)
        padding: 10, // 4.17% of height (like small: 8/184 = 4.35%)
        marginRight: 16,
        borderRadius: 10, // 4.17% of height (like small: 8/184 = 4.35%)
      },
      coverContainer: {
        height: 63, // 26.25% of height (like small: 48/184 = 26.09%)
        borderRadius: 8, // 3.33% of height (like small: 6/184 = 3.26%)
        marginBottom: 10, // 4.17% of height (like small: 8/184 = 4.35%)
      },
      placeholderIcon: {
        fontSize: 16, // 6.67% of height (like small: 12/184 = 6.52%)
      },
      title: {
        fontSize: 13, // 5.42% of height (like small: 10/184 = 5.43%)
        marginBottom: 5, // 2.08% of height (like small: 4/184 = 2.17%)
        lineHeight: 16, // 6.67% of height (like small: 12/184 = 6.52%)
      },
      description: {
        fontSize: 10, // 4.17% of height (like small: 8/184 = 4.35%)
        lineHeight: 13, // 5.42% of height (like small: 10/184 = 5.43%)
      },
      badgeContainer: {
        bottom: 5, // 2.08% of height (like small: 4/184 = 2.17%)
        right: 5, // 2.08% of height (like small: 4/184 = 2.17%)
      },
      badgeText: {
        fontSize: 8, // 3.33% of height (like small: 6/184 = 3.26%)
        paddingHorizontal: 8, // 3.33% of height (like small: 6/184 = 3.26%)
        paddingVertical: 3, // 1.25% of height (like small: 2/184 = 1.09%)
      },
    },
    large: {
      container: {
        height: 320,
        width: 240,
        padding: 14, // 4.38% of height (like small: 8/184 = 4.35%)
        alignSelf: 'center',
        borderRadius: 14, // 4.38% of height (like small: 8/184 = 4.35%)
      },
      coverContainer: {
        height: 84, // 26.25% of height (like small: 48/184 = 26.09%)
        borderRadius: 10, // 3.13% of height (like small: 6/184 = 3.26%)
        marginBottom: 14, // 4.38% of height (like small: 8/184 = 4.35%)
      },
      placeholderIcon: {
        fontSize: 21, // 6.56% of height (like small: 12/184 = 6.52%)
      },
      title: {
        fontSize: 17, // 5.31% of height (like small: 10/184 = 5.43%)
        marginBottom: 7, // 2.19% of height (like small: 4/184 = 2.17%)
        lineHeight: 21, // 6.56% of height (like small: 12/184 = 6.52%)
      },
      description: {
        fontSize: 14, // 4.38% of height (like small: 8/184 = 4.35%)
        lineHeight: 17, // 5.31% of height (like small: 10/184 = 5.43%)
      },
      badgeContainer: {
        bottom: 7, // 2.19% of height (like small: 4/184 = 2.17%)
        right: 7, // 2.19% of height (like small: 4/184 = 2.17%)
      },
      badgeText: {
        fontSize: 10, // 3.13% of height (like small: 6/184 = 3.26%)
        paddingHorizontal: 10, // 3.13% of height (like small: 6/184 = 3.26%)
        paddingVertical: 3, // 0.94% of height (like small: 2/184 = 1.09%)
      },
    },
  };
  
  return sizes[size];
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  coverContainer: {
    width: '100%',
    backgroundColor: '#D1D5DB',
    overflow: 'hidden',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  placeholderIcon: {
    color: '#6B7280',
  },
  title: {
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
  },
  description: {
    color: '#4B5563',
    flex: 1,
  },
  badgeContainer: {
    position: 'absolute',
  },
  badgeText: {
    fontWeight: '400',
    color: '#6B7280',
  },
});
