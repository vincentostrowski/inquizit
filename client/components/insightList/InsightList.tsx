import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { InsightRow } from './InsightRow';

export function InsightList({ insights, onInsightPress, indent, expand, setExpandedStart, userId }) {
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
            indent={indent}
            expand={expandedRows[insight.id]}
            userId={userId}
          />
          {expandedRows[insight.id] && insight.children && insight.children.length > 0 && (
            <InsightList
              insights={insight.children}
              onInsightPress={onInsightPress}
              indent={indent ? indent + 1 : 1}
              expand={expand}
              userId={userId}
              setExpandedStart={setExpandedStart}
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