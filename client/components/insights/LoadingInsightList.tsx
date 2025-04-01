import { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { InsightRow } from './InsightRow';

export function LoadingInsightList({ insights, onInsightPress, expand, setExpandedStart, userId }) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const newExpandedRows: Record<string, boolean> = {};
    if (expand === 2) {
      insights.forEach((insight) => {
        newExpandedRows[insight.id] = true;
      });
    } else if (expand === 1) {
      insights.forEach((insight) => {
        newExpandedRows[insight.id] = false;
      });
    } else {
      return
    }
    setExpandedRows(newExpandedRows);
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
        <View key={insight.id}>
          <InsightRow
            key={insight.id}
            insight={insight}
            onPress={onInsightPress}
            onToggle={() => toggleRow(insight.id)}
            indent={0}
            expand={expandedRows[insight.id]}
            userId={userId}
          />
          {expandedRows[insight.id] && (
            <View style={styles.loadingContainer}>
                <Text>loading ...</Text>
            </View>
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E3E3',
  }
}); 