import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import QuizitHeader from '../components/quizit/QuizitHeader';
import Deck from '../components/quizit/Deck';
import SkeletonLoadingDeck from '../components/quizit/SkeletonLoadingDeck';
import ReasoningBottomSheet from '../components/quizit/ReasoningBottomSheet';
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
        id: 'card-1-1',
        banner: "https://ewwmeflwxqnhbkhfjeuo.supabase.co/storage/v1/object/public/card-banners/cards/371/banner.png?v=1755151551131",
        title: "Contrarian Thinking Reveals Future Trends",
        description: "Disagreeing with popular beliefs fosters insight into the future, which differs from the present and emerges from it.",
        reasoning: "The ability to think independently—especially by challenging widely accepted beliefs—is key to anticipating the future. While the future is unpredictable, its defining feature is that it will differ from the present. If nothing changes, the future remains distant; but if the world transforms quickly, the future arrives sooner. Because the future is shaped by change, not continuity, conventional thinking is poorly suited to recognizing it.\n\nThis principle extends beyond business and technology into personal growth and decision-making. When we question the status quo, we open ourselves to new possibilities that others might miss. The most successful innovations often come from those who dared to think differently about problems that everyone else accepted as unsolvable.\n\nConsider how many breakthrough discoveries were initially met with skepticism or outright rejection. The key is not to be contrarian for its own sake, but to develop the intellectual courage to follow your reasoning wherever it leads, even when it contradicts popular opinion. This requires both analytical rigor and emotional resilience, as independent thinking can be isolating and challenging.\n\nHistorical examples abound of individuals who saw what others could not. Galileo's heliocentric model, Darwin's theory of evolution, and Einstein's relativity all faced initial resistance from established authorities. Yet these ideas eventually transformed our understanding of the world. The pattern is consistent: breakthrough thinking often emerges from questioning fundamental assumptions that others take for granted.\n\nIn the business world, this principle manifests in the success of companies that identified market opportunities others overlooked. Amazon's early focus on books when others dismissed online retail, Tesla's bet on electric vehicles when the industry was committed to internal combustion, and Netflix's pivot to streaming when Blockbuster dominated video rental—all represent contrarian thinking that paid off spectacularly.\n\nThe challenge for individuals and organizations is developing the capacity for independent thought while remaining open to feedback and evidence. True contrarianism is not about being different for its own sake, but about maintaining intellectual integrity in the face of social pressure. It requires the courage to be wrong, the humility to change your mind when presented with better evidence, and the persistence to continue thinking independently even when it's uncomfortable.\n\nThis approach is particularly valuable in times of rapid change, when conventional wisdom becomes outdated quickly. The ability to question assumptions and think independently becomes not just an advantage, but a necessity for navigating an uncertain future. Those who develop this capacity early and consistently will be better positioned to recognize opportunities and avoid pitfalls that others miss.",
        recognitionScore: undefined,
        reasoningScore: undefined,
        hidden: true
      }
    },
    {
      faceType: 'concept' as const,
      conceptData: {
        id: 'card-1-2',
        banner: "https://ewwmeflwxqnhbkhfjeuo.supabase.co/storage/v1/object/public/card-banners/cards/380/banner.png?v=1755154972527",
        title: "Collective Delusions Obscure Truth",
        description: "Groups often embrace flawed beliefs, distorting perceptions and hindering accurate judgment of reality.",
        reasoning: "Even intelligent groups can fall prey to shared delusions, which delay or suppress recognition of deeper truths. This phenomenon occurs when group dynamics override individual critical thinking, creating a false consensus that can persist for years or even decades.\n\nHistory is replete with examples: from the geocentric model of the universe to more recent financial bubbles and technological blind spots. The mechanism is often subtle—individuals may privately harbor doubts but remain silent due to social pressure, fear of ostracism, or the assumption that others must know something they don't.\n\nBreaking free from collective delusions requires both intellectual independence and social courage. It means being willing to voice unpopular opinions, ask uncomfortable questions, and persist in the face of group resistance. The key insight is that truth is not determined by consensus, and sometimes the minority view is the correct one.\n\nThis principle applies not just to scientific or historical matters, but to everyday decisions in organizations, communities, and personal relationships. Learning to recognize and resist groupthink is a crucial skill for anyone seeking to make better decisions and contribute meaningfully to their field.\n\nThe psychology behind collective delusions is complex and multifaceted. Social proof, the tendency to look to others for cues on how to behave, can lead individuals to conform even when their private judgment suggests otherwise. The fear of being wrong alone, combined with the comfort of being wrong together, creates powerful incentives for groupthink.\n\nOrganizational structures often amplify these tendencies. Hierarchical systems can suppress dissent, while consensus-driven cultures may prioritize harmony over accuracy. The result is that groups can become trapped in self-reinforcing cycles of belief that are difficult to break once established.\n\nHowever, there are strategies for maintaining independent thinking within groups. Encouraging devil's advocates, rotating leadership roles, and creating safe spaces for dissent can help prevent collective delusions from taking hold. The goal is not to eliminate group dynamics, but to harness their benefits while mitigating their risks.\n\nIn our increasingly connected world, where information spreads rapidly and social media amplifies group dynamics, the ability to think independently becomes even more crucial. The same technologies that enable collaboration and knowledge sharing can also accelerate the spread of collective delusions, making individual critical thinking skills more valuable than ever.",
        recognitionScore: undefined,
        reasoningScore: undefined,
        hidden: true
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
        id: 'card-2-1',
        banner: "https://ewwmeflwxqnhbkhfjeuo.supabase.co/storage/v1/object/public/card-banners/cards/383/banner.png?v=1755154790211",
        title: "True Contrarianism Is Independent Thought",
        description: "Contrarianism isn't about opposing the crowd, but forming judgments independently of conventional opinion.",
        reasoning: "Real contrarians think clearly and independently—whether or not their views align with the majority. This distinction is crucial because true contrarianism is not about being oppositional for its own sake, but about maintaining intellectual integrity in the face of social pressure.\n\nAuthentic contrarian thinking involves several key elements: first, the ability to question assumptions that others take for granted; second, the willingness to follow evidence wherever it leads, even to uncomfortable conclusions; and third, the courage to express unpopular views when you believe they are correct.\n\nThe challenge lies in distinguishing between genuine independent thinking and mere contrarianism. The former is driven by careful analysis and evidence, while the latter is often motivated by a desire to be different or to gain attention. True contrarians are not trying to be difficult—they are simply unwilling to compromise their intellectual standards for social convenience.\n\nThis approach requires both analytical skills and emotional resilience. You must be able to withstand criticism, isolation, and the possibility of being wrong. But the potential rewards are significant: breakthrough insights, better decisions, and the satisfaction of thinking for yourself rather than following the crowd.",
        recognitionScore: undefined,
        reasoningScore: undefined,
        hidden: true
      }
    }
  ],
  [
    {
      faceType: 'quizit' as const,
      quizitData: {
        quizit: "Another quizit prompt for the third deck..."
      }
    },
    {
      faceType: 'concept' as const,
      conceptData: {
        id: 'card-3-1',
        banner: "https://ewwmeflwxqnhbkhfjeuo.supabase.co/storage/v1/object/public/card-banners/cards/371/banner.png?v=1755151551131",
        title: "Third Concept Title",
        description: "This is the explanation for the third concept...",
        reasoning: "This is the explanation for the third concept...",
        recognitionScore: undefined,
        reasoningScore: undefined,
        hidden: true
      }
    },
    {
      faceType: 'concept' as const,
      conceptData: {
        id: 'card-3-2',
        banner: "https://ewwmeflwxqnhbkhfjeuo.supabase.co/storage/v1/object/public/card-banners/cards/371/banner.png?v=1755151551131",
        title: "Advanced Problem-Solving Strategies",
        description: "Effective problem-solving requires a systematic approach that combines analytical thinking with creative exploration. By breaking down complex challenges into manageable components and exploring multiple solution pathways, we can develop innovative approaches that address root causes rather than just symptoms.",
        reasoning: "Effective problem-solving requires a systematic approach that combines analytical thinking with creative exploration. By breaking down complex challenges into manageable components and exploring multiple solution pathways, we can develop innovative approaches that address root causes rather than just symptoms.",
        recognitionScore: undefined,
        reasoningScore: undefined,
        hidden: true
      }
    }
  ]
];

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
  const { quizitId, quizitTitle } = useLocalSearchParams();
  const scrollViewRef = useRef(null);
  const [quizitItems, setQuizitItems] = useState<typeof mockQuizitItems>([]);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [newlyLoadedDeckIndex, setNewlyLoadedDeckIndex] = useState<number | null>(null);
  const [verticalScrollEnabled, setVerticalScrollEnabled] = useState(true);
  const [showReasoningSheet, setShowReasoningSheet] = useState(false);
  const [currentReasoning, setCurrentReasoning] = useState('');
  const insets = useSafeAreaInsets();
  
  // Calculate available height for full screen modal with top safe area only
  const headerHeight = 60;
  const availableHeight = SCREEN_HEIGHT - insets.top - headerHeight;

  // Simulate loading first deck from edge function
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only load the first deck initially
      setQuizitItems([mockQuizitItems[0]]);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
  
  const handleBack = () => {
    router.back();
  };

  // Function to load next deck
  const loadNextDeck = async () => {
    if (isLoadingNext || quizitItems.length >= mockQuizitItems.length) return;
    
    setIsLoadingNext(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Add the next deck
    const nextDeckIndex = quizitItems.length;
    if (nextDeckIndex < mockQuizitItems.length) {
      setQuizitItems(prev => [...prev, mockQuizitItems[nextDeckIndex]]);
      setNewlyLoadedDeckIndex(nextDeckIndex);
      
      // Clear the newly loaded flag after animation
      setTimeout(() => {
        setNewlyLoadedDeckIndex(null);
      }, 1000);
    }
    
    setIsLoadingNext(false);
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
    
    // Check if the user has scrolled to the bottom (skeleton deck)
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) {
      if (!isLoadingNext && quizitItems.length < mockQuizitItems.length) {
        loadNextDeck();
      }
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
                       onViewReasoning={() => {
                         // Find the reasoning from the current deck's concept cards
                         const conceptCard = items.find(item => item.faceType === 'concept' && item.conceptData);
                         if (conceptCard?.conceptData?.reasoning) {
                           handleViewReasoning(conceptCard.conceptData.reasoning);
                         }
                       }}
                       fadeIn={index === 0 || index === newlyLoadedDeckIndex} // Fade in first deck and newly loaded decks
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
