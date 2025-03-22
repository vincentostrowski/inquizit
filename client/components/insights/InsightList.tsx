import { View, StyleSheet } from 'react-native';
import type { Insight } from '../../data/types';
import { InsightRow } from './InsightRow';

interface InsightListProps {
  insights: Insight[];
  onInsightPress: (insight: Insight) => void;
}

export function InsightList({ insights, onInsightPress }: InsightListProps) {
  return (
    <View style={styles.container}>
      <View style={styles.separator} />
      {insights.map((insight) => (
        <InsightRow
          key={insight._id}
          insight={insight}
          onPress={onInsightPress}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5E5',
  },
}); 