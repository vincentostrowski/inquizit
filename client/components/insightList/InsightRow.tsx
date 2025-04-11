import { Pressable, Text, View, StyleSheet, Animated } from 'react-native';
import type { Insight } from '../../data/types';
import { SaveIcon } from './SaveIcon';
import { useState, useEffect, useRef } from 'react';
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
  const { insightMap, setInsightMap, setInsightTree } = useBook();
  const [fraction, setFraction] = useState(0);

  const animatedFraction = useRef(new Animated.Value(fraction)).current;

  // Animate the progress bar when the fraction computed
  useEffect(() => {
    // Animate the fraction value when it changes
    Animated.timing(animatedFraction, {
      toValue: fraction,
      duration: 500, // Animation duration in milliseconds
      useNativeDriver: false, // `false` because we're animating width (layout property)
    }).start();
  }, [fraction]);

  const animatedWidth = animatedFraction.interpolate({
    inputRange: [0, 1],
    outputRange: ['10%', '110%'], // Map fraction (0 to 1) to percentage width
  });

  const animatedRight = animatedFraction.interpolate({
    inputRange: [0, 1],
    outputRange: ['100%', '0%'], // Adjust the right value dynamically
  });

  // DFS when computing the fraction of saved insights
  function DFS(insight) {
    let total = (insight.leaf) ? 1 : 0; // Count the current insight
    let saved = insight.is_saved ? 1 : 0; // Check if the current insight is saved
  
    // Recursively traverse the children
    if (insight.children && insight.children.length > 0) {
      for (const child of insight.children) {
        const { total: childTotal, saved: childSaved } = DFS(child);
        total += childTotal;
        saved += childSaved;
      }
    }
  
    return { total, saved };
  }

  function computeSavedFraction() {
    let total = 0;
    let saved = 0;
  
    if (insightMap && insightMap[insight.id]) {
      // Perform DFS starting from the root insight 
      const result = DFS(insightMap[insight.id]);
      total = result.total;
      saved = result.saved;
    }
    
    // Return the fraction of saved insights
    return total > 0 ? saved / total : 0;
  }

  // Update the fraction value when the insightMap changes
  useEffect(() => {
    const savedFraction = computeSavedFraction() * 0.9;
    if (savedFraction == 0) {
      setFraction(-0.1);
    } else {
      setFraction(savedFraction);
    }
  }, [insightMap]);

  // Update when insight.is_saved changes and thus render correct save icon
  useEffect(() => {
    setIsSaved(insight.is_saved);
  }, [insight.is_saved]);

  // Update the insight structures stored in context so that other screens refelct the changes
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

  return (
    <Pressable 
      style={styles.content}
      onPress={() => onPress(insight)}
    >
      {!insight.leaf && (
      <View style={styles.barContainer}>
        <Animated.View style={[
          styles.backgroundOverlay, 
          { width: animatedWidth, right: animatedRight }
        ]}/>
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
    transform: [{ skewX: '-30deg' }],
    zIndex: -1, // behind text and icons
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