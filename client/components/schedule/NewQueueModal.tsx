import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, ActivityIndicator, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNewQueue } from '../../hooks/useNewQueue';
import { spacedRepetitionService } from '../../services/spacedRepetitionService';
import { useAuth } from '../../context/AuthContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.5; // 50% of screen height
const FOOTER_HEIGHT = 80; // Approximate footer height including padding

interface NewQueueModalProps {
  visible: boolean;
  onClose: () => void;
  onRefresh?: () => void; // Optional callback to refresh parent screen
}

export default function NewQueueModal({ visible, onClose, onRefresh }: NewQueueModalProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { cards, loading, error, refreshNewQueue } = useNewQueue(user?.id);
  const [selectedCardIds, setSelectedCardIds] = useState<Set<number>>(new Set());
  const [isMoving, setIsMoving] = useState(false);
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      translateY.value = withTiming(0, { duration: 300 });
      backdropOpacity.value = withTiming(0.5, { duration: 300 });
      // Reset selection when modal opens
      setSelectedCardIds(new Set());
      // Refresh queue data when modal opens to ensure it's up-to-date
      refreshNewQueue();
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
      backdropOpacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(setIsVisible)(false);
      });
    }
  }, [visible, refreshNewQueue]);

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
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
      backdropOpacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(setIsVisible)(false);
        runOnJS(onClose)();
      });
    } else {
      translateY.value = withTiming(0, { duration: 200 });
    }
  };

  const handleToggleSelection = (cardId: number) => {
    setSelectedCardIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleMoveToTop = async () => {
    if (!user?.id || selectedCardIds.size === 0) return;

    setIsMoving(true);
    try {
      const cardIdsArray = Array.from(selectedCardIds);
      const { error: moveError } = await spacedRepetitionService.moveCardsToTopOfQueue(
        user.id,
        cardIdsArray
      );

      if (moveError) {
        console.error('Error moving cards to top:', moveError);
        // TODO: Show error message to user
        return;
      }

      // Refresh the queue list
      await refreshNewQueue();
      // Clear selection
      setSelectedCardIds(new Set());
      // Refresh parent screen stats if callback provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Unexpected error moving cards to top:', err);
      // TODO: Show error message to user
    } finally {
      setIsMoving(false);
    }
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
            { height: MODAL_HEIGHT, paddingBottom: insets.bottom },
            animatedSheetStyle,
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>New Queue</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#1D1D1F" />
            </TouchableOpacity>
          </View>

          {/* Content Container */}
          <View style={styles.contentContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#636366" />
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : cards.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No cards in queue</Text>
              </View>
            ) : (
              <>
                <ScrollView 
                  style={styles.scrollView}
                  contentContainerStyle={[
                    styles.scrollContent,
                    selectedCardIds.size > 0 && { paddingBottom: FOOTER_HEIGHT }
                  ]}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                >
                  {cards.map((card: any) => {
                    // Data structure: card.cards.id, card.cards.title, card.cards.books.cover
                    const cardId = card.cards?.id;
                    if (!cardId) return null; // Skip if no card ID
                    
                    const isSelected = selectedCardIds.has(cardId);
                    const bookCover = card.cards?.books?.cover;
                    const cardTitle = card.cards?.title || 'Untitled Card';

                    return (
                      <View key={card.id || `card-${cardId}`} style={styles.cardRow}>
                        <TouchableOpacity
                          style={styles.checkboxContainer}
                          onPress={() => handleToggleSelection(cardId)}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                            {isSelected && (
                              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                            )}
                          </View>
                        </TouchableOpacity>
                        {bookCover && (
                          <Image 
                            source={{ uri: bookCover }} 
                            style={styles.bookCover}
                            resizeMode="cover"
                          />
                        )}
                        <Text style={styles.cardTitle} numberOfLines={2}>
                          {cardTitle}
                        </Text>
                      </View>
                    );
                  })}
                </ScrollView>

                {/* Footer with Move to Top button */}
                {selectedCardIds.size > 0 && (
                  <View style={styles.footer}>
                    <TouchableOpacity
                      style={[styles.moveToTopButton, isMoving && styles.moveToTopButtonDisabled]}
                      onPress={handleMoveToTop}
                      disabled={isMoving}
                      activeOpacity={0.7}
                    >
                      {isMoving ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons name="arrow-up" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                          <Text style={styles.moveToTopText}>
                            Move to Top ({selectedCardIds.size})
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
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
    // Height is set dynamically via inline style: height: MODAL_HEIGHT
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  closeButton: {
    padding: 4,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    minHeight: 0, // Important for flex children to shrink
    paddingHorizontal: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    minHeight: 0, // Important for ScrollView in flex container
  },
  scrollContent: {
    paddingVertical: 16,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#8E8E93',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  bookCover: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: '#F2F2F7',
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    color: '#1D1D1F',
    fontWeight: '500',
  },
  footer: {
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: 'white', // Ensure footer has background
    // Footer is positioned at bottom of contentContainer via flex layout
  },
  moveToTopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  moveToTopButtonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  moveToTopText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

