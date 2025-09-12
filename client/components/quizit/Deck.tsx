import React, { useRef, useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { compareIds } from '../../utils/idUtils';
import { Card } from './Card';

type CardViewState = 'unviewed' | 'viewed' | 'completed';

// Memoized components for better performance
const MemoizedCard = React.memo(Card);

type CardState = 'question' | 'empty' | 'checkmark';

interface DeckProps {
  quizitItems: Array<{
    faceType: 'concept' | 'quizit' | 'blank';
    conceptData?: {
      id: string;
      banner: string;
      title: string;
      description: string;
      reasoning: string;
      status?: CardState;
      recognitionScore?: number;
      reasoningScore?: number;
    };
    quizitData?: {
      quizit: string;
    };
  }>;
  onGestureStart: () => void;
  onGestureEnd: () => void;
  onViewReasoning?: () => void;
  fadeIn?: boolean;
}

export default function Deck({ quizitItems, onGestureStart, onGestureEnd, onViewReasoning, fadeIn = false }: DeckProps) {
  // Enhanced deck state with all card data
  const [deck, setDeck] = useState(() => 
    quizitItems.map(item => ({
      ...item,
      conceptData: item.conceptData ? {
        ...item.conceptData,
        status: 'question' as CardState,
        recognitionScore: undefined,
        reasoningScore: undefined,
      } : undefined
    }))
  );
  const [isTransitioningNext, setIsTransitioningNext] = useState(false);
  const [isTransitioningPrev, setIsTransitioningPrev] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Fade-in animation for navigation and indicators
  const fadeAnim = useRef(new Animated.Value(fadeIn ? 0 : 1)).current;
  
  // Trigger fade-in animation on mount if fadeIn is true
  useEffect(() => {
    if (fadeIn) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [fadeIn, fadeAnim]);
  
  // Single source of truth for card view states
  const [cardViewStates, setCardViewStates] = useState<CardViewState[]>([]);
  
  // Animation timing constants
  const ANIMATION_DURATION = 350; // Total animation time in ms

  // Initialize all cards as unviewed
  useEffect(() => {
    setCardViewStates(deck.map((_, index) => index === 0 ? 'viewed' : 'unviewed'));
  }, []);

  // Simple state transition functions
  const markAsViewed = (index: number) => {
    setCardViewStates(prev => {
      const newStates = [...prev];
      if (newStates[index] === 'unviewed') {
        newStates[index] = 'viewed';
      }
      return newStates;
    });
  };
  
  const markAsCompleted = (index: number) => {
    setCardViewStates(prev => {
      const newStates = [...prev];
      newStates[index] = 'completed';
      return newStates;
    });
  };

  // Check and mark completion based on scores
  const checkAndMarkCompleted = (index: number, deckToCheck?: any[]) => {
    const deckToUse = deckToCheck || deck;
    
    if (index === 0) {
      // Quizit card - check if all concept cards have both scores
      const allConceptCompleted = deckToUse.every((card, i) => {
        if (card.faceType === 'quizit') return true; // Skip quizit card itself
        return card?.conceptData?.recognitionScore !== undefined && 
               card?.conceptData?.reasoningScore !== undefined;
      });
      if (allConceptCompleted) {
        markAsCompleted(index);
      }
    } else {
      // Concept card - check current card's scores (deck[0])
      const card = deckToUse[0];
      if (card?.conceptData?.recognitionScore !== undefined && 
          card?.conceptData?.reasoningScore !== undefined) {
        markAsCompleted(index);
      }
    }
  };

  const handleConceptTap = (cardIndex: number) => {
    // Update deck to reveal the card and change status
    setDeck(prevDeck => {
      const newDeck = [...prevDeck];
      if (newDeck[cardIndex].conceptData) {
        newDeck[cardIndex] = {
          ...newDeck[cardIndex],
          conceptData: {
            ...newDeck[cardIndex].conceptData!,
            status: 'empty' as CardState
          }
        };
      }
      return newDeck;
    });
  };

  const handleScoreChange = (type: 'recognition' | 'reasoning', score: number) => {
    // Calculate updated deck locally
    const updatedDeck = [...deck];
    if (updatedDeck[0].conceptData) {
      updatedDeck[0] = {
        ...updatedDeck[0],
        conceptData: {
          ...updatedDeck[0].conceptData!,
          [type === 'recognition' ? 'recognitionScore' : 'reasoningScore']: score,
          // Update status to checkmark if both scores are now set
          status: (() => {
            const currentScores = updatedDeck[0].conceptData!;
            const newRecognition = type === 'recognition' ? score : currentScores.recognitionScore;
            const newReasoning = type === 'reasoning' ? score : currentScores.reasoningScore;
            
            if (newRecognition !== undefined && newReasoning !== undefined) {
              return 'checkmark' as CardState;
            }
            return currentScores.status || 'question' as CardState;
          })()
        }
      };
    }
    
    // Update state with the calculated deck
    setDeck(updatedDeck);
    
    // Check completion with the updated deck
    checkAndMarkCompleted(currentIndex, updatedDeck);
    
    // This only occurs for concept cards that just completed, check quizit card too
    checkAndMarkCompleted(0, updatedDeck);
  };

  const { width } = Dimensions.get('window');
  const OFF_SCREEN_X = -width * 1.1;
  const [componentWidth, setComponentWidth] = useState(0);

  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const backPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const offScreenPosition = useRef(new Animated.ValueXY({ x: OFF_SCREEN_X, y: 0 })).current;
  const backOffScreenPosition = useRef(new Animated.ValueXY({ x: OFF_SCREEN_X, y: 0 })).current;

  // Helper function for next card animation
  const animateToNext = () => {
    const newIndex = (currentIndex + 1) % deck.length;
    setCurrentIndex(newIndex);
    
    
    Animated.timing(position, {
      toValue: { x: OFF_SCREEN_X, y: 0 },
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Animate offScreen card into position
      Animated.timing(offScreenPosition, {
        toValue: { x: 8, y: 8 },
        duration: 100,
        useNativeDriver: true,
      }).start(() => {
        setIsTransitioningNext(true);
        onGestureEnd();
        rotateDeckNext();
        // Delay resetting animated values to allow re-render with new deck state
        setTimeout(() => {
          offScreenPosition.setValue({ x: OFF_SCREEN_X, y: 0 });
          position.setValue({ x: 0, y: 0 });
          setIsTransitioningNext(false);
        }, 10);
      });
    });
  };

  // Helper function for previous card animation
  const animateToPrev = () => {
    Animated.timing(backPosition, {
      toValue: { x: OFF_SCREEN_X, y: 0 },
      duration: 80,
      useNativeDriver: true,
    }).start(() => {
      const newIndex = (currentIndex - 1 + deck.length) % deck.length;
      setCurrentIndex(newIndex);
      
      
      Animated.timing(backOffScreenPosition, {
        toValue: { x: 0, y: 0 },
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsTransitioningPrev(true);
        onGestureEnd();
        rotateDeckPrev();
        setTimeout(() => {
          backOffScreenPosition.setValue({ x: OFF_SCREEN_X, y: 0 });
          backPosition.setValue({ x: 0, y: 0 });
          setIsTransitioningPrev(false);
        }, 10);
      });
    });
  };

  const rotateDeckNext = () => {
    setDeck((prevDeck: any) => {
      const newDeck = [...prevDeck];
      const removed = newDeck.shift(); 
      newDeck.push(removed); 
      return newDeck;
    });
  };

  const rotateDeckPrev = () => {
    setDeck((prevDeck: any) => {
      const newDeck = [...prevDeck];
      const removed = newDeck.pop();
      newDeck.unshift(removed); 
      return newDeck;
    });
  };

  const handleTap = (event: any) => {
    const tapX = event.nativeEvent.locationX;

    if (tapX < componentWidth / 2) {
      handleLeftTap();
    } else if (tapX > componentWidth / 2) {
      handleRightTap();
    }
  };

  const handleLeftTap = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    onGestureStart();
    
    // Calculate destination index (handles wrapping)
    const destinationIndex = (currentIndex - 1 + deck.length) % deck.length;
    
    // Mark the destination card as viewed
    markAsViewed(destinationIndex);
    
    animateToPrev();
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
      onGestureEnd();
    }, ANIMATION_DURATION);
  };

  const handleRightTap = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    onGestureStart();
    
    // Calculate destination index (handles wrapping)
    const destinationIndex = (currentIndex + 1) % deck.length;
    
    // Mark the destination card as viewed
    markAsViewed(destinationIndex);
    
    animateToNext();
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
      onGestureEnd();
    }, ANIMATION_DURATION);
  };

  return (
    <View style={styles.container}>
      {/* Fake Front Card to move into back */}
      <Animated.View
      style={[
        styles.card,
        { zIndex: 0 },
        {
          transform: [
            { translateX: offScreenPosition.x },
            { translateY: offScreenPosition.y },
          ],
        },
      ]}>
        <MemoizedCard 
          faceType="blank"
        />
      </Animated.View>
      {/* Fake Front Card to Render while transition jump occurs */}
      {isTransitioningNext && (
        <View style={[styles.card, { zIndex: 5 }]}>
          <MemoizedCard 
            faceType={deck[0].faceType}
            conceptData={deck[0].conceptData}
            quizitData={deck[0].quizitData}
            onConceptTap={() => null}
          onViewReasoning={onViewReasoning}
          onScoreChange={handleScoreChange}
          />
        </View>
      )}
      {/* Front Card that handles gesture */}
      {!isTransitioningNext && (
        <Animated.View
          style={[
            styles.card,
            { zIndex: 90 },
            {
              transform: [
                { translateX: position.x },
                { translateY: position.y }, 
                {
                  translateX: backOffScreenPosition.x.interpolate({
                    inputRange: [OFF_SCREEN_X, 0],
                    outputRange: [0, 4],
                    extrapolate: 'clamp',
                  }),
                },
                {
                  translateY: backOffScreenPosition.x.interpolate({
                    inputRange: [OFF_SCREEN_X, 0],
                    outputRange: [0, 4],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
        >
          <ScrollView
            bounces={false}
            overScrollMode='never'
            contentContainerStyle={{ width: '100%', height: '100%' }}
            directionalLockEnabled
            horizontal>
            <Pressable 
              onPress={handleTap} 
              style={{ width: '100%', height: '100%' }}
              onLayout={(event) => {
                const { width } = event.nativeEvent.layout;
                setComponentWidth(width); // Capture the component's width
              }}>
              <MemoizedCard 
                faceType={deck[0].faceType}
                conceptData={deck[0].conceptData}
                quizitData={deck[0].quizitData}
                onConceptTap={() => handleConceptTap(0)}
                onViewReasoning={onViewReasoning}
          onScoreChange={handleScoreChange}
              />
            </Pressable>
          </ScrollView>
        </Animated.View>
      )}
      {/* Back Cards that moves with gesture */}
      {
        deck.slice(1).map((card: any, index: number) => (
          <Animated.View
            key={index}
            style={[
              styles.card,
              { zIndex: 3 - index },
              {
                transform: [
                  ...(index === deck.length - 2
                    ? [
                        { translateX: backPosition.x },
                        { translateY: backPosition.y },
                      ]
                    : [
                      {
                        translateX: backOffScreenPosition.x.interpolate({
                          inputRange: [OFF_SCREEN_X, 0],
                          outputRange: [0, 4],
                          extrapolate: 'clamp',
                        }),
                      },
                      {
                        translateY: backOffScreenPosition.x.interpolate({
                          inputRange: [OFF_SCREEN_X, 0],
                          outputRange: [0, 4],
                          extrapolate: 'clamp',
                        }),
                      },
                    ]),
                  // Apply position-based transforms for all cards
                  {
                    translateX: position.x.interpolate({
                      inputRange: [OFF_SCREEN_X, 0],
                      outputRange: [4 * index, (4 * index) + 4],
                      extrapolate: 'clamp',
                    }),
                  },
                  {
                    translateY: position.x.interpolate({
                      inputRange: [OFF_SCREEN_X, 0],
                      outputRange: [4 * index, (4 * index) + 4],
                      extrapolate: 'clamp',
                    }),
                  },
                ],
              },
            ]}
          >
            <MemoizedCard 
              faceType={index === 0 ? card.faceType : "blank"}
              conceptData={index === 0 ? card.conceptData : undefined}
              quizitData={index === 0 ? card.quizitData : undefined}
              onConceptTap={index === 0 ? () => null : undefined}
              onViewReasoning={index === 0 ? onViewReasoning : undefined}
              onScoreChange={index === 0 ? handleScoreChange : undefined}
            />
          </Animated.View>
        ))
      }
      {!isTransitioningPrev && (
        <Animated.View
          style={[
            styles.card,
            { zIndex: 100 },
            {
              transform: [
                { translateX: backOffScreenPosition.x },
                { translateY: backOffScreenPosition.y },
              ],
            },
          ]}>
          <MemoizedCard 
            faceType={deck[deck.length - 1].faceType}
            conceptData={deck[deck.length - 1].conceptData}
            quizitData={deck[deck.length - 1].quizitData}
            onConceptTap={() => null}
          onViewReasoning={onViewReasoning}
          onScoreChange={handleScoreChange}
          />
        </Animated.View>
      )}
      {isTransitioningPrev && (
        <Animated.View
          style={[
            styles.card,
            { zIndex: 100 },
          ]}>
          <MemoizedCard 
            faceType={deck[0].faceType}
            conceptData={deck[0].conceptData}
            quizitData={deck[0].quizitData}
            onConceptTap={() => null}
          onViewReasoning={onViewReasoning}
          onScoreChange={handleScoreChange}
          />
        </Animated.View>
      )}
      {/* Card Indicators and Navigation */}
      <Animated.View style={[styles.indicatorsAndNavigation, { opacity: fadeAnim }]}>
        {/* Card Indicators */}
        <View style={styles.cardIndicatorContainer}>
          {deck.map((_: any, index: number) => {
            const isActive = currentIndex === index;
            const viewState = cardViewStates[index];
            
            return (
              <View
                key={index}
                style={[
                  styles.cardIndicator,
                  (() => {
                    if (viewState === 'completed') {
                      return isActive ? styles.activeCompletedCardIndicator : styles.completedCardIndicator;
                    }
                    return isActive ? styles.activeCardIndicator : null;
                  })(),
                ]}
              >
                {(() => {
                  switch (viewState) {
                    case 'completed':
                      return (
                        <Ionicons 
                          name="checkmark" 
                          size={12} 
                          color="#ffffff" 
                        />
                      );
                    case 'unviewed':
                      return (
                        <Ionicons 
                          name="help-outline" 
                          size={12} 
                          color={isActive ? '#ffffff' : '#6b6b6b'} 
                        />
                      );
                    case 'viewed':
                    default:
                      return null; // No icon for viewed but not completed
                  }
                })()}
              </View>
            );
          })}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity 
            style={styles.navButtonHitZone} 
            onPress={() => handleLeftTap()}
            activeOpacity={0.7}
          >
            <View style={styles.navButton}>
              <Ionicons name="chevron-back" size={12} color="#6b6b6b" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navButtonHitZone} 
            onPress={() => handleRightTap()}
            activeOpacity={0.7}
          >
            <View style={styles.navButton}>
              <Ionicons name="chevron-forward" size={12} color="#6b6b6b" />
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '80%',
    borderRadius: 12,
    shadowColor: 'black',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  indicatorsAndNavigation: {
    position: 'absolute',
    width: '100%',
    top: '84.5%', // Position right under the cards (80% + 2% gap)
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end', // Align to bottom baseline
    paddingLeft: 20,
    zIndex: 100,
  },
  cardIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    height: 24, // Match nav button height
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24, // Match indicator height
  },
  navButtonHitZone: {
    width: 64,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#d6d6d6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIndicator: {
    width: 18,
    height: 24,
    borderRadius: 2,
    backgroundColor: '#d6d6d6',
    marginHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCardIndicator: {
    backgroundColor: '#8b8b8b',
  },
  completedCardIndicator: {
    backgroundColor: '#90EE90', // Light green
  },
  activeCompletedCardIndicator: {
    backgroundColor: '#4CAF50', // Darker green
  },
});