import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import type { Insight } from "../../../../data/types";
import { useState, useEffect } from "react";
import { InsightList } from "../../../../components/insightList/InsightList";
import { SaveIconInsightPage } from "../../../../components/insightPage/SaveIconInsightPage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBook } from "../../../../data/bookContext";
import { supabase } from "../../../../config/supabase";
import { TopBar } from "../../../../components/universal/topbar/TopBar";
import { useAuth } from "../../../../data/authContext";
import { ProgressBar } from "../../../../components/universal/progressBar";

export default function InsightScreen() {
  const { user } = useAuth();
  const userId = user?.id;
  const { selectedBook, insightMap, setInsightMap, setInsightTree } = useBook();
  const params = useLocalSearchParams();
  const bookId = Array.isArray(params.book) ? params.book[0] : params.book;
  const insightId = params.insight;
  const [insight, setInsight] = useState<Insight | null>(selectedBook && selectedBook.id.toString() === bookId && insightMap ? insightMap[insightId] : null);
  const [childInsights, setChildInsights] = useState<Insight[]>([]);
  const [isSelected, setIsSelected] = useState(insight?.is_saved || false);
  const [preventRepress, setPreventRepress] = useState(false);
  const [fractionSaved, setFractionSaved] = useState(0);
  const [insightCount, setInsightCount] = useState({ saved: 0, total: 0 });
  

  useEffect(() => {
    if (insight) return;
    const loadInsight = async () => {
      const { data: insight, error } = await supabase.from('Insight').select('*').eq('id', insightId).single();
      if (insight) {
        setInsight(insight);
      }
    };
    const loadChildInsights = async () => {
      const { data: insights, error } = await supabase.from('Insight').select('*').eq('parentId', insightId);
      if (insights) {
        setChildInsights(insights);
      }
    };  
    loadInsight();
    loadChildInsights();
  }, [insightId]);

  useEffect(() => {
    if (!insightMap || insightMap.length === 0) return;
    // DFS when computing the fraction of saved insights
    const DFS = (insight) => {
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

    const computeSavedFraction = () => {
      let total = 0;
      let saved = 0;
    
      if (insightMap && insightMap[insight.id]) {
        // Perform DFS starting from the root insight 
        const result = DFS(insightMap[insight.id]);
        total += result.total;
        saved += result.saved;
      }

      // Return the fraction of saved insights
      setInsightCount({saved, total});
      return total > 0 ? saved / total : 0;
    }

    const savedFraction = computeSavedFraction();

    setFractionSaved(savedFraction);
  }, [insightMap]);

  //!!! Eventually update for when insight gone to and need to build insight Map + insight Tree
  //         or will this happen by bookScreen as this will be needed always when insight is gone to

  const handleInsightPress = (insight: Insight) => {
    router.push({
      pathname: "/library/[book]/[insight]",
      params: { 
        book: bookId,
        insight: insight.id
      },
    },);
  };

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
      console.log('Insight saved successfully:');
      updateContext(true);
    }
  };

  const unsaveInsight = async () => {
        // change value on saved column
    const { data, error } = await supabase.from('UserInsight').update({ saved: false }).eq('userId', userId).eq('insightId', insight.id);

    if (error) {
      console.error('Error unsaving insight:', error);
    } else {
      console.log('Insight unsaved successfully:');
      updateContext(false);
    }
  };

  const handleSavePress = () => {
    if (preventRepress) return;
    setPreventRepress(true);
    if (isSelected) {
      unsaveInsight();
    } else {
      saveInsight();
    }
    setIsSelected(!isSelected);
    setTimeout(() => {
      setPreventRepress(false);
    }, 1000);
  };

  if (!insight) {
    return (
      <View style={styles.container}>
        <Text>Insight not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#dfdfdf'}} edges={['top']}>
      <TopBar insight={insight} book={null} insightCount={insightCount}/>
      <ScrollView style={styles.container}>
        <View style={[styles.titleContainer, !insight.leaf && {marginBottom: 40}]}>
          <Text style={styles.title}>{insight.title}</Text>
          <View style={styles.progressContainer}>
          {(!insight.leaf) && (
            <ProgressBar fraction={fractionSaved}/>
          )}
          </View>
          {insight.leaf && (
            <SaveIconInsightPage
              onToggle={handleSavePress}
              isSelected={isSelected}
            />
          )}
        </View>
        {insight.body.map((paragraph: string, index: number) => (
          <Text key={index} style={styles.paragraph}>{paragraph}</Text>
        ))}
        {!insight.leaf && <View style={styles.separator} />}
        <InsightList 
          insights={insight.children || childInsights}
          onInsightPress={handleInsightPress}
          indent={0}
          userId={userId}
          setExpandedStart={(num) => null}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 0,
    textAlign: 'center',
  },
  titleContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal:70,
  },
  progressContainer: {
    width: 80,
    paddingTop: 7,
    paddingHorizontal: 5,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    color: '#333',
    paddingHorizontal: 30,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5E5',
  },
});
