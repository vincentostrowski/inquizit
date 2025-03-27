import { View, StyleSheet } from "react-native";
import Deck from "../components/quizits/Deck";
import ScopeBar from "../components/quizits/ScopeBar";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QuizitScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.scopeBarContainer}>
        <ScopeBar />
      </View>
      <View style={styles.deckContainer}>
        <Deck />
      </View>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});