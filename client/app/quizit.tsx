import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, StatusBar } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import QuizitHeader from '../components/quizit/QuizitHeader';
import Deck from '../components/quizit/Deck';
import { useEffect, useState, useRef } from 'react';

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Snapshot-compatible mock data - multiple decks
const mockQuizitItems = [
  [
    {
      type: 'quizit' as const,
      quizit: "Write a short, realistic scenario (about 100 words) in second person, where you encounter a situation that most people around you accept as normal or true. In this moment, you begin to see flaws or limitations in that assumption and consider a very different possibility—one that contradicts the common belief. The scene should highlight how your observation or thinking diverges from others and how that leads you to envision an alternative path forward."
    },
    {
      type: 'concept' as const,
      insight: {
        title: "Contrarian Thinking Reveals Future Trends",
        coverURL: "https://ewwmeflwxqnhbkhfjeuo.supabase.co/storage/v1/object/public/card-banners/cards/371/banner.png?v=1755151551131"
      },
      explanation: "Disagreeing with popular beliefs fosters insight into the future, which differs from the present and emerges from it. The ability to think independently—especially by challenging widely accepted beliefs—is key to anticipating the future. While the future is unpredictable, its defining feature is that it will differ from the present. If nothing changes, the future remains distant; but if the world transforms quickly, the future arrives sooner. Because the future is shaped by change, not continuity, conventional thinking is poorly suited to recognizing it.",
      banner: "https://ewwmeflwxqnhbkhfjeuo.supabase.co/storage/v1/object/public/card-banners/cards/371/banner.png?v=1755151551131"
    },
    {
      type: 'concept' as const,
      insight: {
        title: "The Power of Unconventional Wisdom",
        coverURL: "https://ewwmeflwxqnhbkhfjeuo.supabase.co/storage/v1/object/public/card-banners/cards/371/banner.png?v=1755151551131"
      },
      explanation: "True wisdom often comes from questioning the status quo and exploring paths less traveled. When everyone thinks the same way, opportunities for breakthrough insights emerge from those willing to challenge conventional assumptions. This unconventional approach to thinking opens doors to innovation and discovery that others miss.",
      banner: "https://ewwmeflwxqnhbkhfjeuo.supabase.co/storage/v1/object/public/card-banners/cards/371/banner.png?v=1755151551131"
    }
  ],
  [
    {
      type: 'quizit' as const,
      quizit: "Another quizit prompt for the second deck..."
    },
    {
      type: 'concept' as const,
      insight: {
        title: "Second Concept Title",
        coverURL: "https://ewwmeflwxqnhbkhfjeuo.supabase.co/storage/v1/object/public/card-banners/cards/371/banner.png?v=1755151551131"
      },
      explanation: "This is the explanation for the second concept...",
      banner: "https://ewwmeflwxqnhbkhfjeuo.supabase.co/storage/v1/object/public/card-banners/cards/371/banner.png?v=1755151551131"
    }
  ],
  [
    {
      type: 'quizit' as const,
      quizit: "Another quizit prompt for the third deck..."
    },
    {
      type: 'concept' as const,
      insight: {
        title: "Third Concept Title",
        coverURL: "https://ewwmeflwxqnhbkhfjeuo.supabase.co/storage/v1/object/public/card-banners/cards/371/banner.png?v=1755151551131"
      },
      explanation: "This is the explanation for the third concept...",
      banner: "https://ewwmeflwxqnhbkhfjeuo.supabase.co/storage/v1/object/public/card-banners/cards/371/banner.png?v=1755151551131"
    },
    {
      type: 'concept' as const,
      insight: {
        title: "Advanced Problem-Solving Strategies",
        coverURL: "https://ewwmeflwxqnhbkhfjeuo.supabase.co/storage/v1/object/public/card-banners/cards/371/banner.png?v=1755151551131"
      },
      explanation: "Effective problem-solving requires a systematic approach that combines analytical thinking with creative exploration. By breaking down complex challenges into manageable components and exploring multiple solution pathways, we can develop innovative approaches that address root causes rather than just symptoms.",
      banner: "https://ewwmeflwxqnhbkhfjeuo.supabase.co/storage/v1/object/public/card-banners/cards/371/banner.png?v=1755151551131"
    }
  ]
];

export default function QuizitScreen() {
  const { quizitId, quizitTitle } = useLocalSearchParams();
  const scrollViewRef = useRef(null);
  const [quizitItems, setQuizitItems] = useState(mockQuizitItems);
  const [verticalScrollEnabled, setVerticalScrollEnabled] = useState(true);
  
  // Calculate available height (similar to snapshot)
  const statusBarHeight = StatusBar.currentHeight || 0;
  const headerHeight = 60;
  const availableHeight = SCREEN_HEIGHT - statusBarHeight - headerHeight;

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
    <View style={styles.container}>
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
    backgroundColor: '#dfdfdf',
  },
  deckContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
