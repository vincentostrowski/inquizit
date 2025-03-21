import { View, Text, StyleSheet } from "react-native";

export default function InsightScreen() {
  return (
    <View style={styles.container}>
      <Text>This is the Insight screen.</Text>
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
