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
import ThemeInputModal from './ThemeInputModal';
import ConfirmationView from './ConfirmationView';
import { Ionicons } from '@expo/vector-icons';
import { useQuizitConfig } from '../../context/QuizitConfigContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface QuizitConfigModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
}

export default function QuizitConfigModal({
  visible,
  title,
  onClose,
}: QuizitConfigModalProps) {
  const { modalData, toggleEditMode, getTotalCardCount, navigateToBookEdit, navigateToLibraryEdit, startQuizitSession, setIsPairedMode, setBiasText } = useQuizitConfig();
  const isEditMode = modalData?.isEditMode || false;
  const bookSelections = modalData?.bookSelections || [];
  const totalCardCount = getTotalCardCount();
  
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [initialCards, setInitialCards] = useState<any[]>([]);

  // Get values from context instead of local state
  const isPairedMode = modalData?.isPairedMode || false;
  const biasText = modalData?.biasText;

  const handleBackdropPress = () => {
    // Check if there are any changes
    const hasThemeChanges = biasText && biasText.trim() !== '';
    const hasCardSelectionChanges = JSON.stringify(bookSelections) !== JSON.stringify(initialCards);
    
    if (hasThemeChanges || hasCardSelectionChanges) {
      // Show confirmation instead of closing
      setShowConfirmation(true);
    } else {
      // No changes, close immediately
      onClose();
    }
  };

  useEffect(() => {
    if (visible) {
      // Reset UI state when modal becomes visible (but keep context values)
      setShowThemeModal(false);
      setShowConfirmation(false);
      
      // Capture initial card selection for comparison
      setInitialCards([...bookSelections]);
      
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
            onPress={handleBackdropPress}
            activeOpacity={1}
          />
        )}
      </Animated.View>

      {/* Modal Content */}
      <Animated.View style={[styles.modal, isEditMode && { pointerEvents: 'box-none', borderTopLeftRadius: 0, borderTopRightRadius: 0 }, animatedSheetStyle]}>
        <View style={[styles.content, { paddingBottom: insets.bottom + 20 }, isEditMode && { pointerEvents: 'auto' }]}>
          {showConfirmation ? (
            <ConfirmationView
              onDiscard={() => {
                onClose();
              }}
              onRestore={() => setShowConfirmation(false)}
            />
          ) : (
            /* Normal Modal Content */
            <>
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
          
          {/* Quizit Configuration Options */}
          {!isEditMode && (
          <View style={styles.configContainer}>
            {/* Single/Pairs Toggle */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Cards per Quizit</Text>
              <View style={styles.toggleWrapper}>
                <TouchableOpacity
                  style={[styles.toggleOption, !isPairedMode && styles.toggleOptionActive]}
                  onPress={() => setIsPairedMode(false)}
                  activeOpacity={0.7} 
                >
                  <Text style={[styles.toggleText, !isPairedMode && styles.toggleTextActive]}>
                    Single
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleOption, isPairedMode && styles.toggleOptionActive]}
                  onPress={() => setIsPairedMode(true)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.toggleText, isPairedMode && styles.toggleTextActive]}>
                    Pairs
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
             {/* Theme Input Button */}
             <View style={styles.inputContainer}>
               <Text style={styles.inputLabel}>
                 Theme for Quizits <Text style={styles.optionalText}>(optional)</Text>
               </Text>
               <TouchableOpacity 
                 style={styles.themeInputButton}
                 onPress={() => setShowThemeModal(true)}
                 activeOpacity={0.7}
               >
                 <Text style={[
                   styles.themeInputText,
                   !biasText && styles.themeInputPlaceholder
                 ]}>
                   {biasText || "Tap to add theme..."}
                 </Text>
               </TouchableOpacity>
             </View>
          </View>)}
          
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
                  onPress={totalCardCount > 0 ? () => startQuizitSession() : undefined}
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
            </>
          )}
        </View>
      </Animated.View>
      
      {/* Theme Input Modal */}
      <ThemeInputModal
        visible={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        onSave={(theme) => setBiasText(theme)}
        initialValue={biasText || ''}
      />
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
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  configContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  toggleContainer: {
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#1D1D1F',
    marginBottom: 6,
  },
  toggleWrapper: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 2,
    alignSelf: 'flex-start',
    width: 160,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleOptionActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
  },
  toggleTextActive: {
    color: '#1D1D1F',
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#1D1D1F',
    marginBottom: 6,
  },
  optionalText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#C7C7CC',
  },
  themeInputButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F9F9F9',
    minHeight: 48,
  },
  themeInputText: {
    flex: 1,
    fontSize: 14,
    color: '#1D1D1F',
    marginRight: 8,
  },
  themeInputPlaceholder: {
    color: '#C7C7CC',
  },
  themeInputIcon: {
    fontSize: 16,
    color: '#8E8E93',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1D1D1F',
    backgroundColor: '#F9F9F9',
    minHeight: 56,
    maxHeight: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 4,
  },
  summaryContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 16,
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
