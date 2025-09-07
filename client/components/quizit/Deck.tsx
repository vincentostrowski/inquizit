import React, { useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';

interface DeckProps {
  quizitItems: Array<{
    faceType: 'concept' | 'quizit';
    conceptData?: {
      banner: string;
      title: string;
      description: string;
      reasoning: string;
    };
    quizitData?: {
      quizit: string;
    };
  }>;
  onGestureStart: () => void;
  onGestureEnd: () => void;
}

export default function Deck({ quizitItems, onGestureStart, onGestureEnd }: DeckProps) {
  const [deck, setDeck] = useState(quizitItems);
  const [isTransitioningNext, setIsTransitioningNext] = useState(false);
  const [isTransitioningPrev, setIsTransitioningPrev] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width } = Dimensions.get('window');
  const OFF_SCREEN_X = -width * 1.1;
  const [componentWidth, setComponentWidth] = useState(0);

  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const backPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const offScreenPosition = useRef(new Animated.ValueXY({ x: OFF_SCREEN_X, y: 0 })).current;
  const backOffScreenPosition = useRef(new Animated.ValueXY({ x: OFF_SCREEN_X, y: 0 })).current;

  // Helper function for next card animation
  const animateToNext = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % deck.length);
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
      setCurrentIndex(prevIndex => (prevIndex - 1 + deck.length) % deck.length);
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
    onGestureStart();
    animateToPrev();
  };

  const handleRightTap = () => {
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
        />
      </Animated.View>
      {/* Fake Front Card to Render while transition jump occurs */}
      {isTransitioningNext && (
        <View style={[styles.card, { zIndex: 5 }]}>
          <Card 
            faceType={deck[0].faceType}
            conceptData={deck[0].conceptData}
            quizitData={deck[0].quizitData}
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
          />
        </Animated.View>
      )}
      <View style={styles.cardIndicatorContainer}>
        {deck.map((_: any, index: number) => (
          <View
            key={index}
            style={[
              styles.cardIndicator,
              currentIndex === index ? styles.activeCardIndicator : null,
            ]}
          >
            {index > 0 && (
              <Ionicons 
                name="help-outline" 
                size={12} 
                color={currentIndex === index ? '#ffffff' : '#6b6b6b'} 
              />
            )}
          </View>
        ))}
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
  cardIndicatorContainer: {
    position: 'absolute',
    width: '100%',
    top: '83%', // Position right under the cards (80% + 2% gap)
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
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
    backgroundColor: '#6b6b6b',
  },
});