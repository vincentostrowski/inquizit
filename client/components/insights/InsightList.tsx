import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import type { Insight } from '../../data/types';
import { InsightRow } from './InsightRow';

interface StructuredInsight extends Insight {
  children: StructuredInsight[];
}

interface InsightListProps {
  insights: StructuredInsight[];
  onInsightPress: (insight: Insight) => void;
  indent: number;
}

export function InsightList({ insights, onInsightPress, indent }: InsightListProps) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle the visibility of the row
    }));
  };
  
  return (
    <View style={styles.container}>
      {insights.map((insight) => (
        <View key={insight._id}>
          <InsightRow
            key={insight._id}
            insight={insight}
            onPress={onInsightPress}
            onToggle={() => toggleRow(insight._id)}
            indent={indent}
          />
          {expandedRows[insight._id] && insight.children && insight.children.length > 0 && (
            <InsightList
              insights={insight.children}
              onInsightPress={onInsightPress}
              indent={indent ? indent + 1 : 1}
            />
          )}  
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 