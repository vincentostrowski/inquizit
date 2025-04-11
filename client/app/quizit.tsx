import { View, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import Deck from "../components/quizits/Deck";
import ScopeBar from "../components/quizits/ScopeBar";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState, useRef } from "react";
import { useQuizit } from '../data/quizitContext';
import { supabase } from "../config/supabase";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function QuizitScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const scrollViewRef = useRef(null);  
  const [quizitItems, setQuizitItems] = useState([]);
  const insets = useSafeAreaInsets();
  const [verticalScrollEnabled, setVerticalScrollEnabled] = useState(false);
  const { currentSession } = useQuizit();
  
  const availableHeight = SCREEN_HEIGHT - (insets.top + 50 + 90);

  useEffect(() => {
    if (!currentSession) return; // Exit if currentSession is not defined
    const fetchItems = async () => {
      const newItem = await fetchQuizitItem(); // Await the resolved data
      if (newItem) {
        setQuizitItems([newItem]);
        
        // Add a short delay to ensure the item is rendered
        setTimeout(() => {
          // Scroll to the first deck (index 1, since index 0 is the placeholder)
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: availableHeight, animated: true });
          }
          
          // After scrolling, we can remove the placeholder
          setTimeout(() => {
            setShowPlaceholder(false);
            setVerticalScrollEnabled(true); // Enable vertical scroll after the placeholder is removed
            
          }, 500); // Wait for scroll animation to complete
          
          setIsLoading(false);
        }, 300);
      } else {
        setIsLoading(false);
      }
    };
    setIsLoading(true);
    setQuizitItems([]); // Reset quizitItems to an empty array
    setShowPlaceholder(true); // Show the placeholder
    setVerticalScrollEnabled(false); // Disable vertical scroll
    fetchItems(); // Call the async function
  }, [currentSession]);

  const fetchQuizitItem = async () => {
    console.log('Fetching quizit item...');
    try {
      console.log(currentSession.id);
      const { data, error } = await supabase.functions.invoke('next-quizit-items', { method: 'POST', body: JSON.stringify({ sessionId: currentSession.id }), });
      // Check for errors 
      if (error) { throw new Error(`Error invoking function: ${error.message}`); }

      return data.quizitItems;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching next quizit item:', error.message);
      } else {
        console.error('Unknown error fetching next quizit item:', error);
      }
    }
  };

  const handleScrollEnd = (event) => {
    if (!currentSession) return; // Exit if currentSession is not defined
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    
    // Check if the user has scrolled to the bottom
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20 && !isLoading) {
      const fetchMoreItems = async () => {
        setIsLoading(true);
        const newItem = await fetchQuizitItem();
        
        if (newItem) {
          setQuizitItems((prevItems) => [...prevItems, newItem]);
        }
        
        setIsLoading(false);
      };
      
      fetchMoreItems();
      console.log(`Have fetched ${quizitItems.length} quizit items`);
    }
  };

  console.log(`Have fetched ${quizitItems.length} quizit items`);

  return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.scopeBarContainer}>
          <ScopeBar sessionTitle={currentSession ? currentSession.title : 'Set up a quizit'}/>
        </View>
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1, backgroundColor: '#f2f2f2'}}
          scrollEnabled={verticalScrollEnabled}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, backgroundColor: '#f2f2f2'}}
          directionalLockEnabled
          pagingEnabled
          onMomentumScrollEnd={handleScrollEnd}
        >
          {showPlaceholder && currentSession && (
            <View style={[styles.placeholderContainer, {height: availableHeight}]}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )}
          {
            quizitItems.map((items, index) => (
              <View key={index} style={[styles.deckContainer, {height: availableHeight}]}>
                <Deck 
                  quizitItems={items}
                  onGestureStart={() => setVerticalScrollEnabled(false)} // Lock scroll for each deck
                  onGestureEnd={() => setVerticalScrollEnabled(true)} // Unlock scroll for each deck
                />
              </View>
            ))
          }
        </ScrollView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dfdfdf',
  },
  scopeBarContainer: {
    height: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  deckContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
});