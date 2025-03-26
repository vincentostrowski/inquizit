import { useEffect, useState } from 'react';
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
  expand: number;
  setExpandedStart: (number: number) => void;
}

export function InsightList({ insights, onInsightPress, indent, expand, setExpandedStart }: InsightListProps) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const newExpandedRows: Record<string, boolean> = {};
    if (expand === 2) {
      insights.forEach((insight) => {
        newExpandedRows[insight._id] = true;
      });
      setExpandedRows(newExpandedRows);
    } else if (expand === 1) {
      insights.forEach((insight) => {
        newExpandedRows[insight._id] = false;
      });
      setExpandedRows(newExpandedRows);
    }
  }, [expand]);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle the visibility of the row
    }));
    setExpandedStart(3);
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
            expand={expandedRows[insight._id]}
          />
          {expandedRows[insight._id] && insight.children && insight.children.length > 0 && (
            <InsightList
              insights={insight.children}
              onInsightPress={onInsightPress}
              indent={indent ? indent + 1 : 1}
              expand={expand}
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