import { View, Text, StyleSheet } from "react-native";

export default function BookScreen() {
  return (
    <View style={styles.container}>
      <Text>This is the Book screen.</Text>
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
