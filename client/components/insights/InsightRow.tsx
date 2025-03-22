import { Pressable, Text, View, StyleSheet, GestureResponderEvent } from 'react-native';
import type { Insight } from '../../data/types';
import { SaveIcon } from './SaveIcon';
import { useState } from 'react';

interface InsightRowProps {
  insight: Insight;
  onPress: (insight: Insight) => void;
}

export function InsightRow({ insight, onPress }: InsightRowProps) {
  const [isSelected, setIsSelected] = useState(false);

  const handleSavePress = () => {
    setIsSelected(!isSelected);
  };

  return (
    <Pressable 
      style={styles.container}
      onPress={() => onPress(insight)}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{insight.title}</Text>
        {insight.leaf && (
          <View style={styles.saveContainer}>
          <SaveIcon
            isSelected={isSelected}
            onToggle={handleSavePress}
            size={24}
          />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  content: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 10,
  },
  saveContainer: {
    height: '100%',
    width: 50,
  },
}); 