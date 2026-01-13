import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import QuizitHeader from '../components/quizit/QuizitHeader';
import Deck from '../components/quizit/Deck';
import SkeletonLoadingDeck from '../components/quizit/SkeletonLoadingDeck';
import ReasoningBottomSheet from '../components/quizit/ReasoningBottomSheet';
import SessionComplete from '../components/quizit/SessionComplete';
import ExpertiseAchievementModal from '../components/achievements/ExpertiseAchievementModal';
import { useEffect, useState, useRef } from 'react';
import { getNextQuizit } from '../services/getNextQuizitService';
import { achievementEmitter, ACHIEVEMENT_EVENTS } from '../utils/achievementEvents';

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Mock mode for styling development - set to false when done
const MOCK_MODE = false;

export default function QuizitScreen() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack.Screen 
        options={{
          presentation: 'fullScreenModal',
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <QuizitScreenContent />
    </GestureHandlerRootView>
  );
}

function QuizitScreenContent() {
  const { sessionTitle, sessionId, sessionType } = useLocalSearchParams();
  const scrollViewRef = useRef(null);
  const [quizitItems, setQuizitItems] = useState<any[]>([]);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [verticalScrollEnabled, setVerticalScrollEnabled] = useState(true);
  const [showReasoningSheet, setShowReasoningSheet] = useState(false);
  const [currentReasoning, setCurrentReasoning] = useState('');
  const latestCardIdsRef = useRef<string[]>([]);
  const quizitCountRef = useRef(0);
  const [reachedBottom, setReachedBottom] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState<{
    totalCards: number;
    newCardsReviewed: number;
    reviewCardsReviewed: number;
  } | null>(null);
  
  // Expertise achievement modal state
  const [showExpertiseModal, setShowExpertiseModal] = useState(false);
  const [achievedBook, setAchievedBook] = useState<{
    bookId: number;
    bookTitle: string;
    bookCover: string;
  } | null>(null);
  
  const insets = useSafeAreaInsets();
  
  // Determine if this is a spaced repetition session
  const isSpacedRepetitionSession = sessionType === 'spaced-repetition';

  // Subscribe to expertise achievement events
  useEffect(() => {
    const unsubscribe = achievementEmitter.on(ACHIEVEMENT_EVENTS.EXPERTISE_ACHIEVED, (data) => {
      console.log('🎉 Expertise achievement received:', data);
      setAchievedBook(data);
      setShowExpertiseModal(true);
    });

    return () => {
      unsubscribe();
    };
  }, []);
  
  // Calculate available height for full screen modal with top safe area only
  const headerHeight = 60;
  const availableHeight = SCREEN_HEIGHT - insets.top - headerHeight;

  // Helper function to extract concept card IDs from quizit items
  const extractConceptCardIds = (items: any[]) => {
    return items
      .filter(item => item.faceType === 'concept')
      .map(item => item.conceptData?.id || item.conceptData?.cardId)
      .filter(Boolean); // Remove any undefined/null values
  };

  // Proactive loading function
  const loadNextDeckProactively = async (cardIdsToExclude?: string[]) => {
    if (isLoadingNext) return;
    
    setIsLoadingNext(true);
    
    // Skip API calls when in mock mode
    if (MOCK_MODE) {
      console.log('Mock mode enabled - skipping proactive loading');
      setIsLoadingNext(false);
      return;
    }
    
    try {
      // Use provided cardIds or fall back to latestCardIds from ref (always current)
      const cardIds = cardIdsToExclude ?? latestCardIdsRef.current;
      console.log('Loading next quizit', { excludedCardCount: cardIds.length });
      
      const response = await getNextQuizit(sessionId as string, cardIds, isSpacedRepetitionSession ? 'spaced-repetition' : 'regular');

      // Check for explicit session completion (spaced repetition sessions)
      if (response.sessionComplete === true) {
        console.log('✅ Session complete!', response.sessionStats);
        setSessionComplete(true);
        if (response.sessionStats) {
          setSessionStats(response.sessionStats);
        }
        setIsLoadingNext(false);
        return;
      }

      if (response.quizitItems && response.quizitItems.length > 0) {
        // Convert API response to the expected format
        const formattedItems = response.quizitItems.map((item: any) => ({
          faceType: item.faceType,
          quizitData: item.quizitData ? {
            ...item.quizitData,
            quizitId: item.quizitData.quizitId // Add quizitId if not present
          } : undefined,
          conceptData: item.conceptData
        }));
        
        // Add to state immediately
        setQuizitItems(prev => [...prev, formattedItems]);
        
        // Update current card IDs
        const newCardIds = extractConceptCardIds(formattedItems);
        latestCardIdsRef.current = newCardIds;
        quizitCountRef.current += 1;
        console.log(`Quizit ${quizitCountRef.current}: Next quizit loaded`, { cardIds: newCardIds });
        
        // Mark as loaded and reset reachedBottom
        setReachedBottom(false);
      }
    } catch (error) {
      console.error('Failed to load next deck:', error);
    }
    
    setIsLoadingNext(false);
  };

  // Load initial quizit and start proactive loading
  useEffect(() => {
    const loadInitialQuizit = async () => {
      // Skip API calls when in mock mode
      if (MOCK_MODE) {
        console.log('Mock mode enabled - skipping API calls');
        setQuizitItems([[]]); // Empty array for the map function
        return;
      }

      if (!sessionId) {
        console.error('No sessionId provided');
        return;
      }

      try {
        console.log('Loading initial quizit...');
        const response = await getNextQuizit(sessionId as string, [], isSpacedRepetitionSession ? 'spaced-repetition' : 'regular');
        
        if (response.quizitItems && response.quizitItems.length > 0) {
          // Convert API response to the expected format
          const formattedItems = response.quizitItems.map((item: any) => ({
            faceType: item.faceType,
            quizitData: item.quizitData ? {
              ...item.quizitData,
              quizitId: item.quizitData.quizitId // Add quizitId if not present
            } : undefined,
            conceptData: item.conceptData
          }));
          
          // Extract and update current card IDs BEFORE setting state
          const cardIds = extractConceptCardIds(formattedItems);
          
          // Set state atomically - initial quizit
          setQuizitItems([formattedItems]);
          latestCardIdsRef.current = cardIds;
          quizitCountRef.current = 1;
          console.log('Quizit 1: Initial quizit loaded', { 
            cardIds,
            quizitData: formattedItems[0]?.quizitData?.core?.[0] 
          });
          
          // Now that initial is loaded, load the next one with the correct card IDs
          loadNextDeckProactively(cardIds);
        }
      } catch (error) {
        console.error('Failed to load initial quizit:', error);
      }
    };

    loadInitialQuizit();
  }, [sessionId, isSpacedRepetitionSession]);
  
  const handleBack = () => {
    router.back();
  };

  const handleViewReasoning = (reasoning: string) => {
    setCurrentReasoning(reasoning);
    setShowReasoningSheet(true);
  };

  const handleCloseReasoning = () => {
    setShowReasoningSheet(false);
  };

  // Real-time scroll detection for immediate response
  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const atBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;
    
    if (atBottom && !reachedBottom) {
      loadNextDeckProactively();
      setReachedBottom(true);
    }
  };

         return (
           <View style={[styles.container, { paddingTop: insets.top }]}>
             <QuizitHeader
               onBack={handleBack}
        quizitTitle={sessionTitle as string}
             />
             <ScrollView
               ref={scrollViewRef}
               style={{ flex: 1, backgroundColor: '#f2f2f2'}}
               scrollEnabled={verticalScrollEnabled}
               showsVerticalScrollIndicator={false}
               contentContainerStyle={{flexGrow: 1, backgroundColor: '#f2f2f2'}}
               directionalLockEnabled
               pagingEnabled
               snapToInterval={availableHeight}
               snapToAlignment="start"
               decelerationRate="fast"
        onScroll={handleScroll}
             >
               
               {
                 quizitItems.map((items, index) => (
                   <View key={index} style={[styles.deckContainer, {height: availableHeight}]}>
                     <Deck 
                       quizitItems={items}
                       onGestureStart={() => setVerticalScrollEnabled(false)} // Lock scroll for each deck
                       onGestureEnd={() => setVerticalScrollEnabled(true)} // Unlock scroll for each deck
                       onViewReasoning={() => {
                         // Find the reasoning from the current deck's concept cards
                  const conceptCard = items.find((item: any) => item.faceType === 'concept' && item.conceptData);
                         if (conceptCard?.conceptData?.reasoning) {
                           handleViewReasoning(conceptCard.conceptData.reasoning);
                         }
                       }}
                      fadeIn={true} // Fade in first deck and newly loaded decks
                      sessionId={sessionId as string}
                      sessionType={isSpacedRepetitionSession ? 'spaced-repetition' : 'regular'}
                      mockMode={MOCK_MODE} // Use the mock mode constant
                     />
                   </View>
                ))
              }
        
        {/* Session Complete Screen */}
        {sessionComplete && (
          <View style={[styles.deckContainer, {height: availableHeight}]}>
            <SessionComplete
              stats={sessionStats || { totalCards: quizitItems.length, newCardsReviewed: 0, reviewCardsReviewed: 0 }}
            />
          </View>
        )}

        {/* Skeleton deck only when loading (not when session complete) */}
        {!sessionComplete && (quizitItems.length === 0 || reachedBottom) && (
                <View style={[styles.deckContainer, {height: availableHeight}]}>
                  <SkeletonLoadingDeck 
                    quizitItems={[]}
                    onGestureStart={() => setVerticalScrollEnabled(false)}
                    onGestureEnd={() => setVerticalScrollEnabled(true)}
                    onViewReasoning={() => {}}
                  />
                </View>
        )}
              
            </ScrollView>
             
             {/* Reasoning Bottom Sheet */}
             <ReasoningBottomSheet
               visible={showReasoningSheet}
               reasoning={currentReasoning}
               onClose={handleCloseReasoning}
             />

             {/* Expertise Achievement Modal */}
             <ExpertiseAchievementModal
               visible={showExpertiseModal}
               bookTitle={achievedBook?.bookTitle || ''}
               bookCover={achievedBook?.bookCover || ''}
               onClose={() => {
                 setShowExpertiseModal(false);
                 setAchievedBook(null);
               }}
             />
           </View>
         );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  deckContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
