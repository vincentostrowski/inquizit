import { View, Text, StyleSheet } from 'react-native';

export default function LibraryHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Inquizit</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
});
