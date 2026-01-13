import React, { useRef, useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions, ScrollView, Pressable, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { compareIds } from '../../utils/idUtils';
import { Card } from './Card';
import { createDebouncedUpdateScores, updateScores } from '../../services/updateScoresService';
import { spacedRepetitionService } from '../../services/spacedRepetitionService';
import { useAuth } from '../../context/AuthContext';
import { getDateKey } from '../../utils/dateUtils';

type CardViewState = 'unviewed' | 'viewed' | 'completed';

// Memoized components for better performance
const MemoizedCard = React.memo(Card);

// Mock data for development/styling
const MOCK_QUIZIT_ITEMS = [
  {
    faceType: 'quizit' as const,
    quizitData: {
      core: [
        "You're renovating your kitchen and have already spent $15,000 on new cabinets.",
        "The contractor discovers the electrical work needs a complete overhaul, costing an additional $8,000."
      ],
      hint: [
        "You're tempted to continue because you've already invested so much.",
        "You know that stopping now would mean all that money was 'wasted'.",
        "The thought of walking away from your investment feels like admitting defeat."
      ],
      quizitId: 'mock-quizit-1'
    }
  },
  {
    faceType: 'concept' as const,
    conceptData: {
      id: 'mock-card-1',
      banner: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      title: 'Sunk Cost Fallacy',
      description: 'People continue a course of action because of previously invested resources, even when quitting is better.',
      reasoning: 'The reader recognizes past investment is irrecoverable and irrelevant to the current choice.',
      bookCover: 'https://ewwmeflwxqnhbkhfjeuo.supabase.co/storage/v1/object/public/book-covers/books/4/cover.avif'
    }
  },
  {
    faceType: 'concept' as const,
    conceptData: {
      id: 'mock-card-2',
      banner: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
      title: 'Confirmation Bias',
      description: 'The tendency to search for, interpret, and recall information in a way that confirms preexisting beliefs.',
      reasoning: 'The reader sees how selective information gathering can reinforce existing viewpoints.',
      bookCover: 'https://ewwmeflwxqnhbkhfjeuo.supabase.co/storage/v1/object/public/book-covers/books/14/cover.jpg'
    }
  },
];

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
      bookCover?: string;
      isNewCard?: boolean; // Flag indicating if card is new (for spaced repetition sessions)
      initialCardState?: {  // NEW: Initial spaced repetition state (fetched in edge function)
        ease_factor: number | null;
        interval_days: number | null;
        repetitions: number | null;
        due: string | null;
        last_reviewed_at: string | null;
        queue: number | null;
      };
    };
    quizitData?: {
      core: string[];
      hint: string[];
      quizitId: string;
    };
  }>;
  onGestureStart: () => void;
  onGestureEnd: () => void;
  onViewReasoning?: () => void;
  fadeIn?: boolean;
  sessionId?: string;
  sessionType?: 'regular' | 'spaced-repetition';
  mockMode?: boolean;
}

export default function Deck({ quizitItems, onGestureStart, onGestureEnd, onViewReasoning, fadeIn = false, sessionId, sessionType = 'regular', mockMode = false }: DeckProps) {
  const { user } = useAuth();
  const userId = user?.id;

  // Use mock data when mockMode is true
  const dataToUse = mockMode ? MOCK_QUIZIT_ITEMS : quizitItems;
  
  // Enhanced deck state with all card data
  
  const [deck, setDeck] = useState(() => 
    dataToUse.map(item => ({
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
  
  // Track which cards have had their daily review recorded (for spaced repetition sessions)
  // Prevents duplicate daily review records if user changes scores multiple times
  const [recordedCardsToday, setRecordedCardsToday] = useState<Set<string>>(new Set());
  
  // Extract the specific value we care about
  const quizitId = quizitItems.find(item => item.quizitData)?.quizitData?.quizitId;

  // Create debounced update function for regular quizit sessions
  const debouncedUpdateScores = useMemo(() => {
    if (!sessionId || !quizitId || sessionType !== 'regular') return null;
    
    return createDebouncedUpdateScores(async (cardData: { id: string; recognitionScore: number; reasoningScore: number }) => {
      try {
        await updateScores(sessionId, quizitId, cardData);
        console.log('Scores updated successfully for card:', cardData.id);
      } catch (error) {
        console.error('Failed to update scores:', error);
      }
    }, 2000); // 2 second debounce
  }, [sessionId, quizitId, sessionType]);

  // Create debounced update function for spaced repetition sessions
  // ALWAYS uses initial card state for calculation (required, not optional)
  const debouncedUpdateSpacedRepetitionScores = useMemo(() => {
    if (sessionType !== 'spaced-repetition' || !userId) return null;
    
    return createDebouncedUpdateScores(async (cardData: { id: string; recognitionScore: number; reasoningScore: number; isNewCard?: boolean; initialCardState?: any }) => {
      try {
        // Get initial card state from cardData (passed directly from handleScoreChange)
        const initialState = cardData.initialCardState;
        
        if (!initialState) {
          console.error('❌ Initial card state not found for card:', cardData.id, '- Cannot update scores');
          // Don't proceed if initial state is not available
          return;
        }

        console.log('🔄 Calculating from initial state (baseline) for card:', cardData.id);

        const { data, error } = await spacedRepetitionService.updateSpacedRepetitionScores(
          userId,
          parseInt(cardData.id),
          cardData.recognitionScore,
          cardData.reasoningScore,
          initialState // REQUIRED: Always pass initial state
        );

        if (error) {
          console.error('Failed to update spaced repetition scores:', error);
          return;
        }

        console.log('✅ Spaced repetition scores updated successfully for card:', cardData.id);

        // Update daily review tracking incrementally (only once per card per session)
        const today = getDateKey(new Date());
        if (today && !recordedCardsToday.has(cardData.id)) {
          const isNewCard = cardData.isNewCard || false;
          await spacedRepetitionService.recordDailyReview(userId, today, 1, isNewCard ? 1 : 0);
          setRecordedCardsToday(prev => new Set([...prev, cardData.id]));
          console.log('📊 Daily review recorded:', { cardId: cardData.id, isNewCard });
        } else if (recordedCardsToday.has(cardData.id)) {
          console.log('⏭️ Skipping daily review - already recorded for card:', cardData.id);
        }
      } catch (error) {
        console.error('Failed to update spaced repetition scores:', error);
      }
    }, 2000); // 2 second debounce
  }, [sessionType, userId, recordedCardsToday]);
  
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
  
  // Track which cards have been revealed (show book cover instead of icon)
  // This tracks by original position, not current deck position
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [currentDisplayText, setCurrentDisplayText] = useState('');
  
  // Function to update display text
  const updateDisplayText = (quizitData: any, hintsRevealed: number) => {
    if (!quizitData) {
      setCurrentDisplayText('');
      return;
    }
    
    const coreText = quizitData.core?.join(' ') || '';
    const revealedHintsArray = quizitData.hint?.slice(0, hintsRevealed) || [];
    const hintText = revealedHintsArray.join(' ');
    
    const fullText = [coreText, hintText].filter(Boolean).join(' ');
    const hasMoreHints = hintsRevealed < (quizitData.hint?.length || 0);
    
    const newText = hasMoreHints ? `${fullText}..` : fullText;
    setCurrentDisplayText(newText);
  };
  
  // Animation timing constants
  const ANIMATION_DURATION = 350; // Total animation time in ms

  // Initialize all cards as unviewed
  useEffect(() => {
    setCardViewStates(deck.map((_, index) => index === 0 ? 'viewed' : 'unviewed'));
    
    // Initialize display text for quizit
    const quizitData = dataToUse[0]?.quizitData;
    if (quizitData) {
      updateDisplayText(quizitData, 0); // Start with 0 hints revealed
    }
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
  
  // Reveal a card (show book cover instead of icon)
  const revealCard = (index: number) => {
    setRevealedCards(prev => new Set([...prev, index]));
  };
  
  // Handle indicator tap - reveal if not revealed, navigate if already revealed
  const handleIndicatorTap = (tappedIndex: number) => {
    // Special handling for quizit indicator (index 0)
    if (tappedIndex === 0 && currentIndex === 0) {
      const quizitData = dataToUse[0]?.quizitData;
      const totalHints = quizitData?.hint?.length || 0;
      
      if (revealedHints < totalHints) {
        // Reveal next hint
        const newRevealedHints = revealedHints + 1;
        setRevealedHints(newRevealedHints);
        // Update display text immediately
        updateDisplayText(quizitData, newRevealedHints);
      }
      return;
    }
    
    // If tapping current card, do nothing
    if (tappedIndex === currentIndex) {
      return;
    }
    
    // Prevent rapid tapping during animations
    if (isAnimating) {
      return;
    }
    
    const isRevealed = revealedCards.has(tappedIndex);
    
    if (!isRevealed) {
      // Not revealed yet - just reveal it
      revealCard(tappedIndex);
    } else {
      // Already revealed - navigate to it
      // Handle special wrap-around cases first
      if (currentIndex === 0 && tappedIndex === 2) {
        // 0 -> 2: go forward
        animateToPrev();
      } else if (currentIndex === 2 && tappedIndex === 0) {
        // 2 -> 0: go forward (wrap around)
        animateToNext();
      } else {
        // All other cases: use simple difference logic
        if (tappedIndex > currentIndex) {
          animateToNext();
        } else {
          animateToPrev();
        }
      }
    }
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
    console.log('type: ', type, 'score: ', score, 'quizitId: ', quizitId, 'sessionType: ', sessionType);
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

    // Call appropriate debounced API update based on session type
    // Only proceed if both scores are set (Issue 1 fix)
    if (updatedDeck[0].conceptData) {
      const recognition = updatedDeck[0].conceptData.recognitionScore;
      const reasoning = updatedDeck[0].conceptData.reasoningScore;
      
      // Only call update if BOTH scores are defined (Issue 1: prevent incomplete updates)
      if (recognition !== undefined && reasoning !== undefined) {
        const cardData = {
          id: updatedDeck[0].conceptData.id,
          recognitionScore: recognition,
          reasoningScore: reasoning,
          isNewCard: updatedDeck[0].conceptData.isNewCard || false, // From conceptData (set by edge function)
          initialCardState: updatedDeck[0].conceptData.initialCardState, // Pass initial state directly (fetched in edge function)
        };

        if (sessionType === 'spaced-repetition' && debouncedUpdateSpacedRepetitionScores) {
          // Spaced repetition: convert scores to Anki rating and update card
          debouncedUpdateSpacedRepetitionScores(cardData);
        } else if (sessionType === 'regular' && debouncedUpdateScores) {
          // Regular quizit: update scores in Redis and quizits table
          debouncedUpdateScores(cardData);
        }
      }
      // If only one score is set, just update local state (no API call)
    }
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
    revealCard(newIndex); // Reveal the card when navigating to it
    
    
    Animated.timing(position, {
      toValue: { x: OFF_SCREEN_X, y: 0 },
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Animate offScreen card into position
      Animated.timing(offScreenPosition, {
        toValue: { x: (deck.length - 1) * 4, y: (deck.length - 1) * 4 },
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
      revealCard(newIndex); // Reveal the card when navigating to it
      
      
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
          displayText=""
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
            displayText={currentDisplayText}
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
            displayText={currentDisplayText}
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
              displayText={index === 0 ? currentDisplayText : ""}
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
            displayText={currentDisplayText}
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
            displayText={currentDisplayText}
          />
        </Animated.View>
      )}
      {/* Card Indicators and Navigation */}
      <Animated.View style={[styles.indicatorsAndNavigation, { opacity: fadeAnim }]}>
        {/* Left Navigation Button */}
        <View style={styles.leftNavContainer}>
          <TouchableOpacity 
            style={styles.navButtonHitZone} 
            onPress={() => handleLeftTap()}
            activeOpacity={0.7}
          >
            <View style={styles.navButton}>
              <Ionicons name="chevron-back" size={16} color="#6b6b6b" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Card Indicators - Centered */}
        <View style={styles.cardIndicatorContainer}>
          {dataToUse.map((originalCard: any, index: number) => {
            const isActive = currentIndex === index;
            const viewState = cardViewStates[index];
            const isRevealed = revealedCards.has(index);
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.cardIndicator,
                  isActive && styles.cardIndicatorActive,
                 ]}
                onPress={() => handleIndicatorTap(index)}
                activeOpacity={0.7}
              >
                {(() => {
                  if (index === 0) {
                    const quizitData = originalCard.quizitData;
                    const totalHints = quizitData?.hint?.length || 0;
                    const hasMoreHints = revealedHints < totalHints;
                    
                    if (hasMoreHints) {
                      // Show add circle when more hints available
                      return (
                        <Ionicons 
                          name="add-circle" 
                          size={isActive ? 24 : 18} 
                          color={'#8b8b8b'} 
                        />
                      );
                    } else {
                      // Show checkmark when all hints revealed
                      return (
                        <Ionicons 
                          name="checkmark" 
                          size={20} 
                          color="#ffffff" 
                        />
                      );
                    }
                  }
                  // If concept card and revealed, show book cover
                  if (isRevealed && originalCard.conceptData?.bookCover) {
                    return (
                      <View style={styles.bookCoverContainer}>
                        <Image 
                          source={{ uri: originalCard.conceptData.bookCover }}
                          style={styles.cardCoverImage}
                          resizeMode="stretch"
                        />
                        {viewState === 'completed' && (
                          <>
                            <View style={styles.checkmarkOverlay} />
                            <Ionicons 
                              name="checkmark" 
                              size={20} 
                              color="white" 
                              style={styles.checkmarkIcon}
                            />
                          </>
                        )}
                      </View>
                    );
                  }
                  
                  // Otherwise show current icon logic
                  switch (viewState) {
                    case 'completed':
                      return (
                        <Ionicons 
                          name="checkmark" 
                          size={20} 
                          color="#ffffff" 
                        />
                      );
                    case 'unviewed':
                      return (
                        <Ionicons 
                          name="help-outline" 
                          size={20} 
                          color={isActive ? '#ffffff' : '#6b6b6b'} 
                        />
                      );
                    case 'viewed':
                    default:
                      return (
                        <View style={styles.viewedIndicator} />
                      );
                  }
                })()}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Right Navigation Button */}
        <View style={styles.rightNavContainer}>
          <TouchableOpacity 
            style={styles.navButtonHitZone} 
            onPress={() => handleRightTap()}
            activeOpacity={0.7}
          >
            <View style={styles.navButton}>
              <Ionicons name="chevron-forward" size={16} color="#6b6b6b" />
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
    justifyContent: 'space-between', // Space between left nav, indicators, and right nav
    alignItems: 'center',
    paddingHorizontal: 0, // Increased padding for more space from nav buttons
    zIndex: 100,
  },
  leftNavContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightNavContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4, // Decreased gap between indicators
    flex: 1, // Take up remaining space
  },
  navButtonHitZone: {
    width: 64,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButton: {
    width: 40, // Increased from 32
    height: 40, // Increased from 32
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIndicator: {
    width: 40,
    height: 52,
    borderRadius: 6,
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#b5b5b5',
  },
  cardIndicatorActive: {
    width: 52,
    height: 66,
    borderRadius: 6,
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#b5b5b5',
  },
  bookCoverContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  cardCoverImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4, // Slightly smaller to account for padding
  },
  checkmarkOverlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    opacity: 0.2,
    borderRadius: 4,
  },
  checkmarkIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -10 }, { translateY: -10 }], // Center the icon
  },
  viewedIndicator: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
});