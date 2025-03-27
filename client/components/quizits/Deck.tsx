import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Dimensions } from 'react-native';
import { Card } from './Card';

export default function Deck({ cards }) {
  const [deck, setDeck] = useState(cards);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { width } = Dimensions.get('window');
  const OFF_SCREEN_X = -width * 1.1;

  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const offScreenPosition = useRef(new Animated.ValueXY({ x: OFF_SCREEN_X, y: 0 })).current;
  // Threshold for swipe acceptance
  const SWIPE_THRESHOLD = -50; // Negative value: swipe left

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
              setIsTransitioning(true);
              rotateDeck();
              setTimeout(() => {
                // Reset animated values
                offScreenPosition.setValue({ x: OFF_SCREEN_X, y: 0 });
                position.setValue({ x: 0, y: 0 });
                setIsTransitioning(false); // show the new top card
              }, 10); // adjust delay as needed
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
});
