import { View, Text, StyleSheet } from 'react-native';

export default function FriendsTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholderText}>Friends feed coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 40,
  },
});

