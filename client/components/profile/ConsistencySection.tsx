import { View, Text, StyleSheet } from "react-native";
import ConsistencyGraph from "../schedule/ConsistencyGraph";

interface ConsistencySectionProps {
  userId: string;
}

export default function ConsistencySection({ userId }: ConsistencySectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Consistency</Text>
        <View style={styles.headerLine} />
      </View>
      <ConsistencyGraph userId={userId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    marginRight: 12,
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E5EA",
  },
});

