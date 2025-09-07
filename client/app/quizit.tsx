import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import QuizitHeader from '../components/quizit/QuizitHeader';
import Deck from '../components/quizit/Deck';
import { useEffect, useState, useRef } from 'react';

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Real data converted to original face structure
const mockQuizitItems = [
  [
    {
      faceType: 'quizit' as const,
      quizitData: {
        quizit: "Write a short, realistic scenario (about 100 words) in second person, where you encounter a situation that most people around you accept as normal or true. In this moment, you begin to see flaws or limitations in that assumption and consider a very different possibility—one that contradicts the common belief. The scene should highlight how your observation or thinking diverges from others and how that leads you to envision an alternative path forward."
      }
    },
    {
      faceType: 'concept' as const,
      conceptData: {
        banner: "https://ewwmeflwxqnhbkhfjeuo.supabase.co/storage/v1/object/public/card-banners/cards/371/banner.png?v=1755151551131",
        title: "Contrarian Thinking Reveals Future Trends",
        description: "Disagreeing with popular beliefs fosters insight into the future, which differs from the present and emerges from it.",
        reasoning: "The ability to think independently—especially by challenging widely accepted beliefs—is key to anticipating the future. While the future is unpredictable, its defining feature is that it will differ from the present. If nothing changes, the future remains distant; but if the world transforms quickly, the future arrives sooner. Because the future is shaped by change, not continuity, conventional thinking is poorly suited to recognizing it."
      }
    },
    {
      faceType: 'concept' as const,
      conceptData: {
        banner: "https://ewwmeflwxqnhbkhfjeuo.supabase.co/storage/v1/object/public/card-banners/cards/380/banner.png?v=1755154972527",
        title: "Collective Delusions Obscure Truth",
        description: "Groups often embrace flawed beliefs, distorting perceptions and hindering accurate judgment of reality.",
        reasoning: "Even intelligent groups can fall prey to shared delusions, which delay or suppress recognition of deeper truths."
      }
    }
  ],
  [
    {
      faceType: 'quizit' as const,
      quizitData: {
        quizit: "Another quizit prompt for the second deck..."
      }
    },
    {
      faceType: 'concept' as const,
      conceptData: {
        banner: "https://ewwmeflwxqnhbkhfjeuo.supabase.co/storage/v1/object/public/card-banners/cards/383/banner.png?v=1755154790211",
        title: "True Contrarianism Is Independent Thought",
        description: "Contrarianism isn't about opposing the crowd, but forming judgments independently of conventional opinion.",
        reasoning: "Real contrarians think clearly and independently—whether or not their views align with the majority."
      }
    }
  ]
];

export default function QuizitScreen() {
  return (
    <>
      <Stack.Screen 
        options={{
          presentation: 'fullScreenModal',
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <QuizitScreenContent />
    </>
  );
}

function QuizitScreenContent() {
  const { quizitId, quizitTitle } = useLocalSearchParams();
  const scrollViewRef = useRef(null);
  const [quizitItems, setQuizitItems] = useState(mockQuizitItems);
  const [verticalScrollEnabled, setVerticalScrollEnabled] = useState(true);
  const insets = useSafeAreaInsets();
  
  // Calculate available height for full screen modal with top safe area only
  const headerHeight = 60;
  const availableHeight = SCREEN_HEIGHT - insets.top - headerHeight;

  const handleBack = () => {
    router.back();
  };

  const handleScrollEnd = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    
    // Check if the user has scrolled to the bottom
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) {
      // Could add more decks here in the future
      console.log('Reached bottom of scroll');
    }
  };

         return (
           <View style={[styles.container, { paddingTop: insets.top }]}>
             <QuizitHeader
               onBack={handleBack}
               quizitTitle={quizitTitle as string}
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
                     />
                   </View>
                 ))
               }
             </ScrollView>
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
