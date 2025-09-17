import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuizitConfig } from '../../context/QuizitConfigContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface QuizitConfigModalProps {
  visible: boolean;
  screenType: 'book' | 'section' | 'card';
  bookCover: string;
  title: string;
  onStartQuizit: () => void;
  onClose: () => void;
}

export default function QuizitConfigModal({
  visible,
  screenType,
  bookCover,
  title,
  onStartQuizit,
  onClose,
}: QuizitConfigModalProps) {
  const { modalData, toggleEditMode, getTotalCardCount, navigateToBookEdit, navigateToLibraryEdit } = useQuizitConfig();
  const isEditMode = modalData?.isEditMode || false;
  const bookSelections = modalData?.bookSelections || [];
  const totalCardCount = getTotalCardCount();
  
  
  // Get current book's card count for normal mode
  const currentBookId = modalData?.bookSelections?.[0]?.bookId || '';
  const currentBookCardCount = bookSelections.find(book => book.bookId === currentBookId)?.selectedCardIds.length || 0;
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

  // Animate backdrop when switching modes
  useEffect(() => {
    if (visible) {
      if (isEditMode) {
        // Fade out backdrop when entering edit mode
        backdropOpacity.value = withTiming(0, { duration: 200 });
      } else {
        // Fade in backdrop when entering normal mode
        backdropOpacity.value = withTiming(0.5, { duration: 200 });
      }
    }
  }, [isEditMode, visible]);

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
    <GestureHandlerRootView style={isEditMode ? styles.containerEditMode : styles.container}>
      {/* Backdrop - Always render but only interactive in normal mode */}
      <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
        {!isEditMode && (
          <TouchableOpacity 
            style={styles.backdropTouchable} 
            onPress={onClose}
            activeOpacity={1}
          />
        )}
      </Animated.View>

      {/* Modal Content */}
      <Animated.View style={[styles.modal, isEditMode && { pointerEvents: 'box-none', borderTopLeftRadius: 0, borderTopRightRadius: 0 }, animatedSheetStyle]}>
        <View style={[styles.content, { paddingBottom: insets.bottom + 20 }, isEditMode && { pointerEvents: 'auto' }]}>
          {/* Header with Title - Only in normal mode */}
          {!isEditMode && (
            <View style={styles.header}>
              <Text style={styles.title}>
                {bookSelections.length > 1 ? 'Custom Quizit Set' : title}
              </Text>
            </View>
          )}
          
          {/* Cover Image(s) - Always shown */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.coversScrollView}
            contentContainerStyle={styles.coversScrollContent}
          >
            {bookSelections.length > 0 && (
              bookSelections.map(book => (
                <TouchableOpacity 
                  key={book.bookId} 
                  style={styles.coverContainer}
                  onPress={() => navigateToBookEdit(book)}
                  activeOpacity={0.8}
                >
                  <Image 
                    source={{ uri: book.bookCover }} 
                    style={styles.coverImage}
                    resizeMode="stretch"
                  />
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{book.selectedCardIds.length}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
            
            {/* Add Book Placeholder - Always last */}
            <TouchableOpacity 
              style={styles.addBookContainer}
              onPress={navigateToLibraryEdit}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color="#8E8E93" />
            </TouchableOpacity>
          </ScrollView>
          
          
          {/* Divider - Always in same position */}
          <View style={styles.divider} />
          
          {/* Action Buttons - Always use buttonContainer */}
          <View style={styles.buttonContainer}>
            {isEditMode ? (
              // Edit Mode Button
              <TouchableOpacity 
                style={styles.bottomButton}
                onPress={toggleEditMode}
                activeOpacity={0.8}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            ) : (
              // Normal Mode Buttons
              <>
                <TouchableOpacity 
                  style={[styles.bottomButton, totalCardCount === 0 && styles.disabledButton]}
                  onPress={totalCardCount > 0 ? onStartQuizit : undefined}
                  activeOpacity={totalCardCount > 0 ? 0.8 : 1}
                  disabled={totalCardCount === 0}
                >
                  <Text style={[styles.startButtonText, totalCardCount === 0 && styles.disabledButtonText]}>Start</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.bottomButton}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.bottomButton}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Clear</Text>
                </TouchableOpacity>
              </>
            )}
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
  containerEditMode: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    pointerEvents: 'box-none', // Allow touch events to pass through to background
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
  modal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  content: {
    alignItems: 'center',
  },
  header: {
    width: '100%',
    paddingTop: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1D1D1F',
    textAlign: 'center',
  },
  coversScrollView: {
    padding: 12,
    width: '100%',
  },
  coversScrollContent: {
    paddingHorizontal: 0,
  },
  coverContainer: {
    alignItems: 'center',
    position: 'relative',
    marginRight: 8,
  },
  coverImage: {
    width: 60,
    height: 80,
    borderRadius: 6,
    resizeMode: 'stretch',
    borderWidth: 0.5,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  badgeContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -14 }, { translateY: -14 }],
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  addBookContainer: {
    alignItems: 'center',
    position: 'relative',
    marginRight: 8,
    width: 60,
    height: 80,
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CEC5BC',
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E5E5E7',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    justifyContent: 'center',
  },
  bottomButton: {
    width: '25%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E5E7',
  },
  startButtonText: {
    color: '#1D1D1F',
    fontSize: 14,
    fontWeight: '500',
  },
  cancelButtonText: {
    color: '#1D1D1F',
    fontSize: 14,
    fontWeight: '500',
  },
  saveButtonText: {
    color: '#1D1D1F',
    fontSize: 14,
    fontWeight: '500',
  },
  noSelectionsContainer: {
    width: 60,
    height: 80,
    borderRadius: 6,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  noSelectionsText: {
    fontSize: 10,
    color: '#8E8E93',
    textAlign: 'center',
    fontWeight: '500',
  },
  doneButtonText: {
    color: '#1D1D1F',
    fontSize: 14,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#F2F2F7',
    borderColor: '#E5E5EA',
  },
  disabledButtonText: {
    color: '#8E8E93',
  },
});
