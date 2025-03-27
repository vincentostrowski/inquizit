import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import Deck from "../components/quizits/Deck";
import ScopeBar from "../components/quizits/ScopeBar";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { decks } from "../data/quizits";
import { useState } from "react";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function QuizitScreen() {
  const insets = useSafeAreaInsets();
  const [verticalScrollEnabled, setVerticalScrollEnabled] = useState(true);
  
  const availableHeight = SCREEN_HEIGHT - (insets.top + 30 + 85);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.scopeBarContainer}>
        <ScopeBar />
      </View>
      <ScrollView
        scrollEnabled={verticalScrollEnabled}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1}}
        directionalLockEnabled
        pagingEnabled
      >
        {
          decks.map((deck, index) => (
            <View key={index} style={[styles.deckContainer, {height: availableHeight}]}>
              <Deck 
                cards={deck}
                onGestureStart={() => setVerticalScrollEnabled(false)} // Lock scroll for each deck
                onGestureEnd={() => setVerticalScrollEnabled(true)} // Unlock scroll for each deck
              />
            </View>
          ))
        }
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scopeBarContainer: {
    height: 30,
    paddingHorizontal: 20,
    width: '100%',
  },
  deckContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});