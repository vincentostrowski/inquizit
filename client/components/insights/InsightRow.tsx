import { Pressable, Text, View, StyleSheet, GestureResponderEvent } from 'react-native';
import type { Insight } from '../../data/types';
import { SaveIcon } from './SaveIcon';
import { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface InsightRowProps {
  insight: Insight;
  onPress: (insight: Insight) => void;
  onToggle: () => void;
  indent: number;
  expand: boolean;
}

export function InsightRow({ insight, onPress, indent, onToggle, expand }: InsightRowProps) {
  const [isSaved, setIsSaved] = useState(false);

  const handleSavePress = () => {
    setIsSaved(!isSaved);
  };

  const handleToggle = () => {
    onToggle();
  };

  const fraction = 1 * 0.9;

  return (
    <Pressable 
      style={styles.content}
      onPress={() => onPress(insight)}
    >
      {!insight.leaf && (
      <View style={styles.barContainer}>
        <View style={[
          styles.backgroundOverlay, 
          { width: `${fraction * 100}%`, right: `${104 - fraction * 100}%` }
        ]}/>
        <View style={[styles.angleOverlay, {right: `${100 - fraction * 100}%`}]} />
      </View>
      )}

      <Text style={[{ paddingLeft: 15 + indent * 15 }, styles.title]}>{insight.title}</Text>

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
          <Icon name={expand ? "arrow-drop-up" : "arrow-drop-down"} size={30} color="black" style={styles.expand} />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E3E3E3',
    position: 'relative',
  },
  barContainer: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    opacity: 0.05,
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'black', // your desired background color
    zIndex: -1, // behind text and icons
  },
  angleOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 30, // adjust the width to control the size of the angled area
    backgroundColor: 'black',
    transform: [{ skewX: '-30deg' }], // angle the left edge by 10 degrees
    zIndex: -1,
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