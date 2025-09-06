import { View, Text, StyleSheet } from 'react-native';

interface ContentDescriptionProps {
  description: string;
}

export default function ContentDescription({ description }: ContentDescriptionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 26,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  description: {
    fontSize: 14,
    color: '#1D1D1F',
    lineHeight: 20,
  },
});
