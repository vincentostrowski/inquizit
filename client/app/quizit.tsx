import { StyleSheet } from "react-native";
import Deck from "../components/quizits/Deck";
import ScopeBar from "../components/quizits/ScopeBar";
import { SafeAreaView } from 'react-native-safe-area-context';

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
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
});