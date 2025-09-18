import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, TextInput, Keyboard, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MODAL_HEIGHT = 200; // Fixed modal height
const BUTTON_HEIGHT = 60; // Fixed button area height
const INPUT_HEIGHT = MODAL_HEIGHT - BUTTON_HEIGHT; // Remaining space for input

interface ThemeInputModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (theme: string) => void;
  initialValue?: string;
}

export default function ThemeInputModal({ 
  visible, 
  onClose, 
  onSave, 
  initialValue = '' 
}: ThemeInputModalProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const [isVisible, setIsVisible] = useState(false);
  const [themeText, setThemeText] = useState(initialValue);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Calculate modal position based on keyboard height
  const getModalPosition = () => {
    const availableHeight = SCREEN_HEIGHT - keyboardHeight;
    const modalBottom = availableHeight - MODAL_HEIGHT;
    return Math.max(modalBottom, 50); // Minimum 50px from top
  };

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      const position = getModalPosition();
      translateY.value = withTiming(position, { duration: 300 });
      backdropOpacity.value = withTiming(0.5, { duration: 300 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
      backdropOpacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(setIsVisible)(false);
      });
    }
  }, [visible, keyboardHeight]);

  // Keyboard listeners
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener?.remove();
      keyboardWillHideListener?.remove();
    };
  }, []);

  const handleSave = () => {
    onSave(themeText);
    onClose();
  };

  const handleClear = () => {
    setThemeText('');
  };

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

  if (!isVisible) return null;

  return (
    <GestureHandlerRootView style={styles.container}>
      <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
        <TouchableOpacity 
          style={styles.backdropTouchable} 
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>
      
      <Animated.View style={[styles.sheet, animatedSheetStyle]}>
        <View style={styles.content}>
          {/* Input Area */}
          <View style={styles.inputArea}>
            <TextInput
              style={styles.textInput}
              value={themeText}
              onChangeText={setThemeText}
              placeholder="Write about the context you want to prepare for and center the quizits around..."
              placeholderTextColor="#8E8E93"
              multiline
              maxLength={200}
              autoFocus
              textAlignVertical="top"
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={handleClear}
              activeOpacity={0.8}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.doneButton}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
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
    backgroundColor: '#000000',
  },
  backdropTouchable: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: MODAL_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputArea: {
    flex: 1,
    paddingTop: 16,
    paddingBottom: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1D1D1F',
    backgroundColor: '#F9F9F9',
    textAlignVertical: 'top',
  },
  placeholderText: {
    color: '#C7C7CC',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: BUTTON_HEIGHT,
    gap: 12,
    paddingBottom: 16,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E5E7',
  },
  clearButtonText: {
    color: '#1D1D1F',
    fontSize: 14,
    fontWeight: '500',
  },
  doneButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E5E7',
  },
  doneButtonText: {
    color: '#1D1D1F',
    fontSize: 14,
    fontWeight: '500',
  },
});