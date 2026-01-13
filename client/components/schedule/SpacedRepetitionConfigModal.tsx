import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThemeInputModal from '../quizit/ThemeInputModal';
import { useSpacedRepetitionConfig } from '../../context/SpacedRepetitionConfigContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SpacedRepetitionConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SpacedRepetitionConfigModal({
  visible,
  onClose,
}: SpacedRepetitionConfigModalProps) {
  const {
    configData,
    setIsPairedMode,
    setBiasText,
    setReviewCardOrder,
    setCardInterleaving,
    startSpacedRepetitionSession,
  } = useSpacedRepetitionConfig();

  const isPairedMode = configData?.isPairedMode || false;
  const biasText = configData?.biasText;
  const reviewCardOrder = configData?.reviewCardOrder || 'ordered';
  const cardInterleaving = configData?.cardInterleaving || 'review-first';

  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const handleBackdropPress = () => {
    // No confirmation needed - just close
    onClose();
  };

  useEffect(() => {
    if (visible) {
      // Reset UI state when modal becomes visible
      setShowThemeModal(false);
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

  const handleStart = async () => {
    if (isStarting) return;

    setIsStarting(true);
    try {
      await startSpacedRepetitionSession();
      // Navigation and modal close handled by context
    } catch (error: any) {
      console.error('Error starting spaced repetition session:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to start spaced repetition session. Please try again.'
      );
    } finally {
      setIsStarting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          onPress={handleBackdropPress}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Modal Content */}
      <Animated.View style={[styles.modal, animatedSheetStyle]}>
        <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Spaced Repetition Session</Text>
          </View>

          {/* Quizit Configuration Options */}
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

            {/* Review Card Order Toggle */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Review Card Order</Text>
              <View style={styles.toggleWrapper}>
                <TouchableOpacity
                  style={[styles.toggleOption, reviewCardOrder === 'ordered' && styles.toggleOptionActive]}
                  onPress={() => setReviewCardOrder('ordered')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.toggleText, reviewCardOrder === 'ordered' && styles.toggleTextActive]}>
                    Ordered
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleOption, reviewCardOrder === 'random' && styles.toggleOptionActive]}
                  onPress={() => setReviewCardOrder('random')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.toggleText, reviewCardOrder === 'random' && styles.toggleTextActive]}>
                    Random
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Card Interleaving Toggle */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Card Ordering</Text>
              <View style={styles.toggleWrapper}>
                <TouchableOpacity
                  style={[styles.toggleOption, cardInterleaving === 'review-first' && styles.toggleOptionActive]}
                  onPress={() => setCardInterleaving('review-first')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.toggleText, cardInterleaving === 'review-first' && styles.toggleTextActive]}>
                    Review First
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleOption, cardInterleaving === 'interleaved' && styles.toggleOptionActive]}
                  onPress={() => setCardInterleaving('interleaved')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.toggleText, cardInterleaving === 'interleaved' && styles.toggleTextActive]}>
                    Interleaved
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
                <Text
                  style={[
                    styles.themeInputText,
                    !biasText && styles.themeInputPlaceholder,
                  ]}
                >
                  {biasText || 'Tap to add theme...'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.bottomButton, isStarting && styles.disabledButton]}
              onPress={isStarting ? undefined : handleStart}
              activeOpacity={isStarting ? 1 : 0.8}
              disabled={isStarting}
            >
              <Text
                style={[
                  styles.startButtonText,
                  isStarting && styles.disabledButtonText,
                ]}
              >
                {isStarting ? 'Starting...' : 'Start'}
              </Text>
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
              onPress={() => {
                setIsPairedMode(false);
                setBiasText(undefined);
                setReviewCardOrder('ordered');
                setCardInterleaving('review-first');
                onClose();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Theme Input Modal */}
      <ThemeInputModal
        visible={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        onSave={(theme) => setBiasText(theme || undefined)}
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
    paddingBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1D1D1F',
    textAlign: 'center',
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
  },
  toggleOption: {
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
  disabledButton: {
    backgroundColor: '#F2F2F7',
    borderColor: '#E5E5EA',
  },
  disabledButtonText: {
    color: '#8E8E93',
  },
});

