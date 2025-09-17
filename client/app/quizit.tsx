import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import QuizitHeader from '../components/quizit/QuizitHeader';
import Deck from '../components/quizit/Deck';
import SkeletonLoadingDeck from '../components/quizit/SkeletonLoadingDeck';
import ReasoningBottomSheet from '../components/quizit/ReasoningBottomSheet';
import { useEffect, useState, useRef } from 'react';
import { getNextQuizit } from '../services/getNextQuizitService';

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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
  const { sessionTitle, sessionId } = useLocalSearchParams();
  const scrollViewRef = useRef(null);
  const [quizitItems, setQuizitItems] = useState<any[]>([]);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [newlyLoadedDeckIndex, setNewlyLoadedDeckIndex] = useState<number | null>(null);
  const [verticalScrollEnabled, setVerticalScrollEnabled] = useState(true);
  const [showReasoningSheet, setShowReasoningSheet] = useState(false);
  const [currentReasoning, setCurrentReasoning] = useState('');
  const [latestCardIds, setLatestCardIds] = useState<string[]>([]);
  const [reachedBottom, setReachedBottom] = useState(false);
  const insets = useSafeAreaInsets();
  
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
  const loadNextDeckProactively = async () => {
    if (isLoadingNext) return;
    
    setIsLoadingNext(true);
    
    try {
      console.log('Loading next quizit for session:', sessionId);
      console.log('Current card IDs to exclude:', latestCardIds);
      
      const response = await getNextQuizit(sessionId as string, latestCardIds);
      
      if (response.quizitItems && response.quizitItems.length > 0) {
        // Convert API response to the expected format
        const formattedItems = response.quizitItems.map((item: any) => ({
          faceType: item.faceType,
          quizitData: item.quizitData ? {
            ...item.quizitData,
            quizitId: item.quizitId // Add quizitId if not present
          } : undefined,
          conceptData: item.conceptData
        }));
        
        // Add to state immediately
        setQuizitItems(prev => [...prev, formattedItems]);
        
        // Update current card IDs
        const newCardIds = extractConceptCardIds(formattedItems);
        setLatestCardIds(newCardIds);
        console.log('Next quizit loaded, new card IDs:', newCardIds);
        
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
      if (!sessionId) {
        console.error('No sessionId provided');
        return;
      }

      try {
        console.log('Loading initial quizit for session:', sessionId);
        const response = await getNextQuizit(sessionId as string, []);
        
        if (response.quizitItems && response.quizitItems.length > 0) {
          // Convert API response to the expected format
          const formattedItems = response.quizitItems.map((item: any) => ({
            faceType: item.faceType,
            quizitData: item.quizitData ? {
              ...item.quizitData,
              quizitId: item.quizitId // Add quizitId if not present
            } : undefined,
            conceptData: item.conceptData
          }));
          
          setQuizitItems([formattedItems]);
          
          // Extract and update current card IDs
          const cardIds = extractConceptCardIds(formattedItems);
          setLatestCardIds(cardIds);
          console.log('Initial quizit loaded, card IDs:', cardIds);
          
          // Start proactive loading for next deck
          loadNextDeckProactively();
        }
      } catch (error) {
        console.error('Failed to load initial quizit:', error);
      }
    };

    loadInitialQuizit();
  }, [sessionId]);
  
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

  const handleScrollEnd = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const atBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    
    if (atBottom) {
      // User reached bottom
      if (reachedBottom) return; // Already handled, exit early
      
      setReachedBottom(true);
      loadNextDeckProactively();
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
        onMomentumScrollEnd={handleScrollEnd}
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
                  const conceptCard = items.find(item => item.faceType === 'concept' && item.conceptData);
                  if (conceptCard?.conceptData?.reasoning) {
                    handleViewReasoning(conceptCard.conceptData.reasoning);
                  }
                }}
                fadeIn={index === 0 || index === newlyLoadedDeckIndex} // Fade in first deck and newly loaded decks
                sessionId={sessionId as string}
              />
            </View>
          ))
        }
        {/* Skeleton deck always at bottom */}
          <View style={[styles.deckContainer, {height: availableHeight}]}>
            <SkeletonLoadingDeck 
              quizitItems={[]}
              onGestureStart={() => setVerticalScrollEnabled(false)}
              onGestureEnd={() => setVerticalScrollEnabled(true)}
              onViewReasoning={() => {}}
            />
          </View>
        
      </ScrollView>
      
      {/* Reasoning Bottom Sheet */}
      <ReasoningBottomSheet
        visible={showReasoningSheet}
        reasoning={currentReasoning}
        onClose={handleCloseReasoning}
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
