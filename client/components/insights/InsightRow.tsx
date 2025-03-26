import { Pressable, Text, View, StyleSheet, GestureResponderEvent } from 'react-native';
import type { Insight } from '../../data/types';
import { SaveIcon } from './SaveIcon';
import { useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';


interface InsightRowProps {
  insight: Insight;
  onPress: (insight: Insight) => void;
  onToggle: () => void;
  indent: number;
}

export function InsightRow({ insight, onPress, indent, onToggle }: InsightRowProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSavePress = () => {
    setIsSaved(!isSaved);
  };

  const handleToggle = () => {
    setExpanded(!expanded);
    onToggle();
  };

  return (
    <Pressable 
      style={{ paddingLeft: 5 + indent * 10 }}
      onPress={() => onPress(insight)}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{insight.title}</Text>
        {insight.leaf && (
          <View style={styles.saveContainer}>
            <SaveIcon
              isSelected={isSaved}
              onToggle={handleSavePress}
              size={16}
            />
          </View>
        )}
        {!insight.leaf && (
          <Pressable style={styles.expandContainer} onPress={handleToggle}>
            <Icon name={expanded ? "arrow-drop-up" : "arrow-drop-down"} size={30} color="black" style={styles.expand} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingLeft: 5,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 10,
  },
  saveContainer: {
    height: '100%',
    width: 30,
  },
  expandContainer: {
    height: '100%',
    width: 30,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expand: {
    opacity: 0.3,
  },
}); 