import { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from "react-native";
import Swiper from 'react-native-deck-swiper';
import { Card } from "./Card";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function Deck() {
  const [cards, setCards] = useState([
    { title: "Quizit 1" },
    { title: "Quizit 2" },
    { title: "Quizit 3" },
  ]);

  return (
    <View style={styles.container}>
      <Swiper
        cards={cards}
        renderCard={(card) => (
          <View style={styles.cardContainer}>
            <Card title={card.title} />
          </View>
        )}
        infinite={true}
        cardIndex={0}
        backgroundColor="transparent"
        verticalSwipe={false}
        {...(cards.length == 1 ? { horizontalSwipe: false } : {})}
        showSecondCard={true}
        stackSize={cards.length}          // how many total cards to stack
        stackSeparation={15}   // vertical spacing for the underlying cards
        inputRotationRange={[-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2]}
        outputRotationRange={["0deg", "0deg", "0deg"]} // no rotation
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    zIndex: 100,
  },
  cardContainer: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.7,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
  },
});