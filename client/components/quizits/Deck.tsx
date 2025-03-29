import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, Animated, Dimensions, ScrollView } from 'react-native';
import { Card } from './Card';

export default function Deck({ cards, onGestureStart, onGestureEnd }) {
  const [deck, setDeck] = useState(cards);
  const [isTransitioningNext, setIsTransitioningNext] = useState(false);
  const [isTransitioningPrev, setIsTransitioningPrev] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width } = Dimensions.get('window');
  const OFF_SCREEN_X = -width * 1.1;

  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const backPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const offScreenPosition = useRef(new Animated.ValueXY({ x: OFF_SCREEN_X, y: 0 })).current;
  const backOffScreenPosition = useRef(new Animated.ValueXY({ x: OFF_SCREEN_X, y: 0 })).current;
  // Threshold for swipe acceptance
  const SWIPE_THRESHOLD = -50; // Negative value: swipe left

  const gestureStarted = useRef(false);
  // re-enable vertical scrolling when gesture ends

  // Helper function that finalizes the gesture
  const finalizeGestureNext = (gestureState, nongesture) => {
    gestureStarted.current = false;

    if (gestureState.dx <= SWIPE_THRESHOLD || nongesture) {
      setCurrentIndex(prevIndex => (prevIndex + 1) % deck.length);
      Animated.timing(position, {
        toValue: { x: OFF_SCREEN_X, y: 0 },
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        // Animate offScreen card into position
        Animated.timing(offScreenPosition, {
          toValue: { x: 8, y: 8 },
          duration: 200,
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
          }, 10); // adjust delay as needed
        });
      });
    } else {
      // Snap back if swipe doesn't meet threshold
      onGestureEnd();
      Animated.spring(backPosition, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start();
      Animated.spring(position, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start();
    }
  };

  const finalizeGesturePrev = (gestureState, nongesture) => {
    gestureStarted.current = false;

    if (gestureState.dx >= -1 * SWIPE_THRESHOLD || nongesture) {
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
    } else {
      onGestureEnd();
      Animated.spring(backPosition, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start();
      Animated.spring(position, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start();
    }
  };

  const panResponderNext = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => Math.abs(gestureState.dx) * 2 > Math.abs(gestureState.dy),
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        return Math.abs(gestureState.dx) * 2 > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!gestureStarted.current && Math.abs(gestureState.dx) * 2 > Math.abs(gestureState.dy)) {
          gestureStarted.current = true;
          onGestureStart();
        }
        // Move the card with the user's finger
        const dx = gestureState.dx < -5 ? gestureState.dx : 0;
        position.setValue({ x: dx, y: 0 });
        const backCardX = gestureState.dx > 5 ? -1 * gestureState.dx : 0;
        backPosition.setValue({ x: backCardX, y: 0 });
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 0) {
          finalizeGesturePrev(gestureState, false);
        } else {
          finalizeGestureNext(gestureState, false);
        }
      },
      onPanResponderTerminate: (evt, gestureState) => {
        if (gestureState.dx > 0) {
          finalizeGesturePrev(gestureState, false);
        } else {
          finalizeGestureNext(gestureState, false);
        }
      },
    })
  ).current;

  const rotateDeckNext = () => {
    setDeck(prevDeck => {
      const newDeck = [...prevDeck];
      const removed = newDeck.shift(); 
      newDeck.push(removed); 
      return newDeck;
    });
  };

  const rotateDeckPrev = () => {
    setDeck(prevDeck => {
      const newDeck = [...prevDeck];
      const removed = newDeck.pop();
      newDeck.unshift(removed); 
      return newDeck;
    });
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
        <Card card={deck[0]} />
      </Animated.View>

      {/* Fake Front Card to Render while transition jump occurs */}
      {isTransitioningNext && (
        <View style={[styles.card, { zIndex: 5 }]}>
          <Card card={deck[0]} />
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
          {...panResponderNext.panHandlers}
        >
          <ScrollView
            bounces={false}
            overScrollMode='never'
            contentContainerStyle={{ width: '100%', height: '100%' }}
            directionalLockEnabled
            horizontal>
            <Card card={deck[0]} />
          </ScrollView>
        </Animated.View>
      )}

      {/* Back Cards that moves with gesture */}
      {
        deck.slice(1).map((card, index) => (
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
            <Card card={card} />
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
          <Card card={deck[deck.length - 1]} />
        </Animated.View>
      )}

      {isTransitioningPrev && (
        <Animated.View
          style={[
            styles.card,
            { zIndex: 100 },
          ]}>
          <Card card={deck[0]} />
        </Animated.View>
      )}


      <View style={styles.dotContainer}>
        {deck.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index ? styles.activeDot : null,
            ]}
          />
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
    height: '100%',
    backgroundColor: '#fff8ef',
    borderRadius: 5,
    shadowColor: 'black',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  dotContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'black',
    marginHorizontal: 4,
    opacity: 0.1,
  },
  activeDot: {
    opacity: 0.25,
  },
});
