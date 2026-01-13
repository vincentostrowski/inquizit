import React, { useRef, useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SkeletonCard } from './SkeletonCard';

type CardViewState = 'unviewed' | 'viewed' | 'completed';

// Memoized components for better performance
const MemoizedCard = React.memo(SkeletonCard);

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
}

// Mock skeleton data for loading state
const skeletonQuizitItems = [
  {
    faceType: 'quizit' as const,
    quizitData: {
      quizit: "Loading quizit content..."
    }
  },
  {
    faceType: 'concept' as const,
    conceptData: {
      id: 'skeleton-1',
      banner: '',
      title: 'Loading concept...',
      description: 'Loading description...',
      reasoning: 'Loading reasoning...',
      status: 'question' as CardState,
      recognitionScore: undefined,
      reasoningScore: undefined,
    }
  },
];

export default function SkeletonLoadingDeck({ quizitItems, onGestureStart, onGestureEnd, onViewReasoning }: DeckProps) {
  // Use skeleton data instead of empty quizitItems
  const [deck, setDeck] = useState(() => 
    skeletonQuizitItems.map(item => ({
      ...item,
      conceptData: item.conceptData ? {
        ...item.conceptData,
        status: 'question' as CardState,
        recognitionScore: undefined,
        reasoningScore: undefined,
      } : undefined
    }))
  );

  const { width } = Dimensions.get('window');
  const OFF_SCREEN_X = -width * 1.1;
  const [componentWidth, setComponentWidth] = useState(0);

  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const backPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const offScreenPosition = useRef(new Animated.ValueXY({ x: OFF_SCREEN_X, y: 0 })).current;
  const backOffScreenPosition = useRef(new Animated.ValueXY({ x: OFF_SCREEN_X, y: 0 })).current;

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
      {/* Front Card that handles gesture */}
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
              onPress={null} 
              style={{ width: '100%', height: '100%' }}
              onLayout={(event) => {
                const { width } = event.nativeEvent.layout;
                setComponentWidth(width); // Capture the component's width
              }}>
              <MemoizedCard 
                faceType={deck[0].faceType}
                conceptData={deck[0].conceptData}
                quizitData={deck[0].quizitData}
                onConceptTap={() => null}
                onViewReasoning={onViewReasoning}
            onScoreChange={() => null}
              />
            </Pressable>
          </ScrollView>
        </Animated.View>
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
              onScoreChange={index === 0 ? () => null : undefined}
            />
          </Animated.View>
        ))
      }
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