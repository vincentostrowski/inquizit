import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Dimensions } from 'react-native';

export default function ThreeCardDeck() {
  const [deck, setDeck] = useState(['SKFLJS:FJ:S', 'B', '_________']);

  const { width } = Dimensions.get('window');
  const OFF_SCREEN_X = -width * 1.1;

  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const offScreenPosition = useRef(new Animated.ValueXY({ x: OFF_SCREEN_X, y: 0 })).current;
  // Threshold for swipe acceptance
  const SWIPE_THRESHOLD = -100; // Negative value: swipe left

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        // Move the card with the user's finger
        const dx = gestureState.dx < 0 ? gestureState.dx : 0;
        position.setValue({ x: dx, y: 0 });
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx <= SWIPE_THRESHOLD) {
          // If swipe passes threshold, animate card off-screen
          Animated.timing(position, {
            toValue: { x: OFF_SCREEN_X, y: 0 },
            duration: 300,
            useNativeDriver: false,
          }).start(() => {
            // When animation finishes, rotate the deck
            Animated.timing(offScreenPosition, {
              toValue: { x: 8, y: 8 },
              duration: 200,
              useNativeDriver: false,
            }).start(() => {
              // After animation, reset offScreenPosition and the drag position for next swipe
              rotateDeck();
              offScreenPosition.setValue({ x: OFF_SCREEN_X, y: 0 });
              position.setValue({ x: 0, y: 0 });
            });
          });
        } else {
          // Otherwise, spring back to original position
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
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
      <Text style={styles.cardText}>{deck[0]}</Text>
    </Animated.View>

      {/* Back card (animated with interpolation) */}
      <Animated.View style={[styles.card, { zIndex: 2 }, cardCStyle]}>
        <Text style={styles.cardText}>{deck[2]}</Text>
      </Animated.View>

      {/* Middle card (animated with interpolation) */}
      <Animated.View style={[styles.card, { zIndex: 3 }, cardBStyle]}>
        <Text style={styles.cardText}>{deck[1]}</Text>
      </Animated.View>

      {/* Top card (fully draggable) */}
      <Animated.View
        style={[
          styles.card,
          { zIndex: 4 },
          {
            transform: [
              { translateX: position.x },
              { translateY: position.y },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Text style={styles.cardText}>{deck[0]}</Text>
      </Animated.View>
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
    backgroundColor: 'beige',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'black',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
  },
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
