import React, { useRef, useState, useMemo } from 'react';
import { View, StyleSheet, Animated, Dimensions, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { compareIds } from '../../utils/idUtils';
import { Card } from './Card';

type CardState = 'question' | 'empty' | 'checkmark';

interface DeckProps {
  quizitItems: Array<{
    faceType: 'concept' | 'quizit';
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
  blockGesture: boolean;
}

export default function Deck({ quizitItems, onGestureStart, onGestureEnd, onViewReasoning, blockGesture }: DeckProps) {
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
  const [viewedCards, setViewedCards] = useState<Set<string>>(new Set());
  const [isTransitioningNext, setIsTransitioningNext] = useState(false);
  const [isTransitioningPrev, setIsTransitioningPrev] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Mark initial card as viewed when component mounts
  React.useEffect(() => {
    const initialCard = deck[0];
    if (initialCard?.conceptData?.id) {
      setViewedCards(prev => new Set([...prev, initialCard.conceptData!.id]));
    }
  }, []);

  // Create position mapping for concept cards (position 1, 2, 3...)
  const positionMap = useMemo(() => {
    const map: Record<number, string> = {};
    let conceptIndex = 1; // Start at 1 (0 is quizit)
    
    quizitItems.forEach((item) => {
      if (item.faceType === 'concept' && item.conceptData?.id) {
        map[conceptIndex] = item.conceptData.id;
        conceptIndex++;
      }
    });
    
    return map;
  }, [quizitItems]);

  // Helper function to check if all concept cards are completed
  const allConceptCardsCompleted = useMemo(() => {
    return deck.every(item => {
      if (item.faceType === 'concept' && item.conceptData) {
        return item.conceptData.recognitionScore !== undefined && 
               item.conceptData.reasoningScore !== undefined;
      }
      return true; // Non-concept cards are considered "completed"
    });
  }, [deck]);

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
    // Update the current card's score in deck state
    setDeck(prevDeck => {
      const newDeck = [...prevDeck];
      if (newDeck[0].conceptData) {
        newDeck[0] = {
          ...newDeck[0],
          conceptData: {
            ...newDeck[0].conceptData!,
            [type === 'recognition' ? 'recognitionScore' : 'reasoningScore']: score,
            // Update status to checkmark if both scores are now set
            status: (() => {
              const currentScores = newDeck[0].conceptData!;
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
      return newDeck;
    });
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
    
    // Mark the new card as viewed
    const newCard = deck[newIndex];
    if (newCard.conceptData?.id) {
      setViewedCards(prev => new Set([...prev, newCard.conceptData!.id]));
    }
    
    Animated.timing(position, {
      toValue: { x: OFF_SCREEN_X, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      // Animate offScreen card into position
      Animated.timing(offScreenPosition, {
        toValue: { x: 8, y: 8 },
        duration: 150,
        useNativeDriver: false,
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
      useNativeDriver: false,
    }).start(() => {
      const newIndex = (currentIndex - 1 + deck.length) % deck.length;
      setCurrentIndex(newIndex);
      
      // Mark the new card as viewed
      const newCard = deck[newIndex];
      if (newCard.conceptData?.id) {
        setViewedCards(prev => new Set([...prev, newCard.conceptData!.id]));
      }
      
      Animated.timing(backOffScreenPosition, {
        toValue: { x: 0, y: 0 },
        duration: 200,
        useNativeDriver: false,
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
    if (blockGesture) return;
    onGestureStart();
    animateToPrev();
  };

  const handleRightTap = () => {
    if (blockGesture) return;
    onGestureStart();
    animateToNext();
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
        <Card 
          faceType={deck[0].faceType}
          conceptData={deck[0].conceptData}
          quizitData={deck[0].quizitData}
          onConceptTap={() => null}
          onViewReasoning={onViewReasoning}
          onScoreChange={handleScoreChange}
        />
      </Animated.View>
      {/* Fake Front Card to Render while transition jump occurs */}
      {isTransitioningNext && (
        <View style={[styles.card, { zIndex: 5 }]}>
          <Card 
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
              <Card 
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
            <Card 
              faceType={card.faceType}
              conceptData={card.conceptData}
              quizitData={card.quizitData}
              onConceptTap={() => null}
          onViewReasoning={onViewReasoning}
          onScoreChange={handleScoreChange}
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
          <Card 
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
          <Card 
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
      <View style={styles.indicatorsAndNavigation}>
        {/* Card Indicators */}
        <View style={styles.cardIndicatorContainer}>
          {deck.map((_: any, index: number) => {
            const isActive = currentIndex === index;
            
            return (
              <View
                key={index}
                style={[
                  styles.cardIndicator,
                  (() => {
                    // For index 0 (quizit card), use completion state if all concept cards are done
                    if (index === 0) {
                      if (allConceptCardsCompleted) {
                        return isActive ? styles.activeCompletedCardIndicator : styles.completedCardIndicator;
                      }
                      return isActive ? styles.activeCardIndicator : null;
                    }
                    
                    // For concept cards (index > 0), find the card by its original position
                    const cardId = positionMap[index];
                    const card = deck.find(item => item.conceptData?.id && compareIds(item.conceptData.id, cardId));
                    const isCompleted = card?.conceptData && 
                      card.conceptData.recognitionScore !== undefined && 
                      card.conceptData.reasoningScore !== undefined;
                    
                    if (isActive && isCompleted) {
                      return styles.activeCompletedCardIndicator;
                    } else if (isActive) {
                      return styles.activeCardIndicator;
                    } else if (isCompleted) {
                      return styles.completedCardIndicator;
                    }
                    return null;
                  })(),
                ]}
              >
                {(() => {
                  // For index 0 (quizit card), show completed state if all concept cards are done
                  if (index === 0) {
                    if (allConceptCardsCompleted) {
                      return (
                        <Ionicons 
                          name="checkmark" 
                          size={12} 
                          color="#ffffff" 
                        />
                      );
                    }
                    return null;
                  }
                  
                  // For concept cards (index > 0), find the card by its original position
                  const cardId = positionMap[index];
                  const card = deck.find(item => item.conceptData?.id && compareIds(item.conceptData.id, cardId));
                  const isCompleted = card?.conceptData && 
                    card.conceptData.recognitionScore !== undefined && 
                    card.conceptData.reasoningScore !== undefined;
                  const isViewed = card?.conceptData?.id && viewedCards.has(card.conceptData.id);
                  
                  // Only show checkmark for completed cards, nothing for viewed but incomplete cards
                  if (isCompleted) {
                    return (
                      <Ionicons 
                        name="checkmark" 
                        size={12} 
                        color="#ffffff" 
                      />
                    );
                  }
                  
                  // Show nothing for viewed but incomplete cards, question mark for unviewed cards
                  if (!isViewed) {
                    return (
                      <Ionicons 
                        name="help-outline" 
                        size={12} 
                        color={isActive ? '#ffffff' : '#6b6b6b'} 
                      />
                    );
                  }
                  
                  return null;
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
      </View>
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