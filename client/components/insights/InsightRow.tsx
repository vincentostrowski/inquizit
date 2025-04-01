import { Pressable, Text, View, StyleSheet, GestureResponderEvent } from 'react-native';
import type { Insight } from '../../data/types';
import { SaveIcon } from './SaveIcon';
import { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { supabase } from "../../config/supabase";
import { useBook } from '../../data/bookContext';

interface InsightRowProps {
  insight: Insight;
  onPress: (insight: Insight) => void;
  onToggle: () => void;
  indent: number;
  expand: boolean;
  userId: string;
}

export function InsightRow({ insight, onPress, indent, onToggle, expand, userId }: InsightRowProps) {
  const [isSaved, setIsSaved] = useState(insight.is_saved);
  const [preventRepress , setPreventRepress] = useState(false);
  const { setInsightMap, setInsightTree } = useBook();

  useEffect(() => {
    setIsSaved(insight.is_saved);
  }, [insight.is_saved]);

    const updateContext = (save: boolean) => {
      setInsightTree((prevTree) => {
        return prevTree ? [...prevTree] : [];
      });
      setInsightMap((prevMap) => {
        if (!prevMap || !prevMap[insight.id]) return prevMap;
    
        // Mutate the shared object reference (safe within setState)
        prevMap[insight.id].is_saved = save;
    
        return { ...prevMap }; // New top-level map reference to trigger re-renders
      });
    };

  const saveInsight = async () => {
        // add a new row or change value on saved column
        console.log('userId:', userId);
        const { data, error } = await supabase.from('UserInsight').upsert(
      {
        userId,
        insightId: insight.id,
        bookId: insight.bookId,
        saved: true,
      },
      { onConflict: ['userId', 'insightId'] } // if a row exists, update it
    );

  if (error) {
    console.error('Error saving insight:', error);
  } else {
    console.log('Insight saved successfully:', data);
    updateContext(true);
  }
  };

  const unsaveInsight = async () => {
        // change value on saved column
    const { data, error } = await supabase.from('UserInsight').update({ saved: false }).eq('userId', userId).eq('insightId', insight.id);
    if (error) {
      console.error('Error unsaving insight:', error);
    } else {
      console.log('Insight unsaved successfully:', data);
      updateContext(false);
    }
  };

  const handleSavePress = () => {
    if (preventRepress) return;
    setPreventRepress(true);
    if (isSaved) {
      unsaveInsight();
    } else {
      saveInsight();
    }
    setIsSaved(!isSaved);
    setTimeout(() => {
      setPreventRepress(false);
    }, 1000);
  };

  const handleToggle = () => {
    onToggle();
  };

  const fraction = 0.4 * 0.9;

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