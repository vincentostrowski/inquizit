import { StyleSheet } from "react-native";
import Deck from "../components/quizits/Deck";
import ScopeBar from "../components/quizits/ScopeBar";
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from "react-native-gesture-handler";

export default function QuizitScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScopeBar />
        <Deck />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  feed: {
    display: 'flex',
    flexDirection: 'column',
  }
});