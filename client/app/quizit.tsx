import { View, Text, StyleSheet } from "react-native";

export default function QuizitScreen() {
  return (
    <View style={styles.container}>
      <Text>This is the Quizit screen.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
