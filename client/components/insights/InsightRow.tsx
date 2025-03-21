import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { Insight } from '../../data/types';

interface InsightRowProps {
  insight: Insight;
  onPress: (insight: Insight) => void;
}

export function InsightRow({ insight, onPress }: InsightRowProps) {
  return (
    <Pressable 
      style={styles.container}
      onPress={() => onPress(insight)}
    >
      <View style={styles.separator} />
      <Text style={styles.title}>{insight.title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    paddingVertical: 16,
  },
}); 