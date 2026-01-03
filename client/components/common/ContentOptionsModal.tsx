import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export type ContentType = 'book' | 'card';

interface ContentOptionsModalProps {
  visible: boolean;
  contentType: ContentType;
  isSaved: boolean;
  onClose: () => void;
  onSave: () => void;
  onUnsave: () => void;
}

export default function ContentOptionsModal({
  visible,
  contentType,
  isSaved,
  onClose,
  onSave,
  onUnsave,
}: ContentOptionsModalProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      translateY.value = withTiming(0, { duration: 300 });
      backdropOpacity.value = withTiming(0.5, { duration: 300 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
      backdropOpacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(setIsVisible)(false);
      });
    }
  }, [visible]);

  const animatedSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const animatedBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
    };
  });

  const handleGestureEvent = (event: any) => {
    const { translationY } = event.nativeEvent;
    
    if (translationY > 0) {
      translateY.value = translationY;
    }
  };

  const handleGestureEnd = (event: any) => {
    const { translationY, velocityY } = event.nativeEvent;
    
    if (translationY > 100 || velocityY > 500) {
      // Dismiss the sheet
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
      backdropOpacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(setIsVisible)(false);
        runOnJS(onClose)();
      });
    } else {
      // Snap back to original position
      translateY.value = withTiming(0, { duration: 200 });
    }
  };

  const handleAction = () => {
    if (isSaved) {
      onUnsave();
    } else {
      onSave();
    }
    onClose();
  };

  const getActionText = () => {
    if (isSaved) {
      return contentType === 'book' ? 'Unsave Book' : 'Unsave Card';
    } else {
      return contentType === 'book' ? 'Save Book' : 'Save Card';
    }
  };

  const getActionIcon = () => {
    return isSaved ? 'bookmark' : 'bookmark-outline';
  };

  if (!isVisible) return null;

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Bottom Sheet */}
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleGestureEnd}
      >
        <Animated.View
          style={[
            styles.bottomSheet,
            { paddingBottom: insets.bottom + 20 },
            animatedSheetStyle,
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Content */}
          <View style={styles.content}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleAction}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <Ionicons 
                  name={getActionIcon()} 
                  size={24} 
                  color="#1D1D1F" 
                  style={styles.icon}
                />
                <Text style={styles.optionText}>{getActionText()}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  optionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#1D1D1F',
  },
});

