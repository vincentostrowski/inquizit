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
  
  const availableHeight = SCREEN_HEIGHT - (insets.top + 50 + 90);

  return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.scopeBarContainer}>
          <ScopeBar />
        </View>
        <ScrollView
          scrollEnabled={verticalScrollEnabled}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, backgroundColor: '#f2f2f2'}}
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
    backgroundColor: 'white',
  },
  scopeBarContainer: {
    height: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  deckContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});