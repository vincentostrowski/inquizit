import { View, StyleSheet } from "react-native";
import { BookGrid } from "../../components/library/BookGrid";

export default function LibraryScreen() {
  return (
    <View style={styles.container}>
      <BookGrid />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
});
