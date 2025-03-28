import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, Animated, Dimensions } from 'react-native';
import { Card } from './Card';

export default function Deck({ cards, onGestureStart, onGestureEnd }) {
  const [deck, setDeck] = useState(cards);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width } = Dimensions.get('window');
  const OFF_SCREEN_X = -width * 1.1;

  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const offScreenPosition = useRef(new Animated.ValueXY({ x: OFF_SCREEN_X, y: 0 })).current;
  // Threshold for swipe acceptance
  const SWIPE_THRESHOLD = -50; // Negative value: swipe left

  const gestureStarted = useRef(false);
  // re-enable vertical scrolling when gesture ends

  // Helper function that finalizes the gesture
  const finalizeGesture = (gestureState) => {
    onGestureEnd(); // re-enable vertical scrolling, etc.
    gestureStarted.current = false;

    if (gestureState.dx <= SWIPE_THRESHOLD) {
      // Animate card off-screen
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
          setIsTransitioning(true);
          rotateDeck();
          // Delay resetting animated values to allow re-render with new deck state
          setTimeout(() => {
            offScreenPosition.setValue({ x: OFF_SCREEN_X, y: 0 });
            position.setValue({ x: 0, y: 0 });
            setIsTransitioning(false);
          }, 10); // adjust delay as needed
        });
      });
    } else {
      // Snap back if swipe doesn't meet threshold
      Animated.spring(position, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start();
    }
  };

  const panResponder = useRef(
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
        const dx = gestureState.dx < 0 ? gestureState.dx : 0;
        position.setValue({ x: dx, y: 0 });
      },
      onPanResponderRelease: (evt, gestureState) => {
        finalizeGesture(gestureState);
      },
      onPanResponderTerminate: (evt, gestureState) => {
        finalizeGesture(gestureState);
      },
    })
  ).current;

  // Function to rotate the deck: move the first card to the end
  const rotateDeck = () => {
    setDeck(prevDeck => {
      const newDeck = [...prevDeck];
      const removed = newDeck.shift(); // remove the front card
      newDeck.push(removed); // add it to the end
      return newDeck;
    });
  };

   // Interpolated animated styles for the second card (deck[1])
   const cardBStyle = {
    transform: [
      {
        translateX: position.x.interpolate({
          inputRange: [OFF_SCREEN_X, 0],
          outputRange: [0, 4],
          extrapolate: 'clamp',
        }),
      },
      {
        translateY: position.x.interpolate({
          inputRange: [OFF_SCREEN_X, 0],
          outputRange: [0, 4],
          extrapolate: 'clamp',
        }),
      },
    ],
  };

  // Interpolated animated styles for the third card (deck[2])
  const cardCStyle = {
    transform: [
      {
        translateX: position.x.interpolate({
          inputRange: [OFF_SCREEN_X, 0],
          outputRange: [4, 8],
          extrapolate: 'clamp',
        }),
      },
      {
        translateY: position.x.interpolate({
          inputRange: [OFF_SCREEN_X, 0],
          outputRange: [4, 8],
          extrapolate: 'clamp',
        }),
      },
    ],
  };

  const cardStyles = [cardBStyle, cardCStyle];

  return (
    <View style={styles.container}>
      {/* Dummy Card */}
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

      {/* Front card */}
      {isTransitioning && (
        <View style={[styles.card, { zIndex: 5 }]}>
          <Card card={deck[0]} />
        </View>
      )}
      {!isTransitioning && (
        <Animated.View
          style={[
            styles.card,
            { zIndex: 100 },
            {
              transform: [
                { translateX: position.x },
                { translateY: position.y },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <Card card={deck[0]} />
        </Animated.View>
      )}
      {
        deck.slice(1).map((card, index) => (
          <Animated.View
            key={index}
            style={[styles.card, { zIndex: 3 - index }, cardStyles[index]]}
          >
            <Card card={card} />
          </Animated.View>
        ))
      }
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
    borderRadius: 5,
    backgroundColor: '#fff1e1',
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
