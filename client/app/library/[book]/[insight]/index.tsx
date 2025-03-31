import { View, Text, StyleSheet, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import type { Insight } from "../../../../data/types";
import { QuizitButton } from "../../../../components/QuizitButton";
import { useState, useEffect } from "react";
import { InsightList } from "../../../../components/insights/InsightList";
import { SaveIcon } from "@/components/insights/SaveIcon";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBook } from "../../../../data/bookContext";
import { supabase } from "../../../../config/supabase";

export default function InsightScreen() {
  const { selectedBook, insightMap } = useBook();
  const params = useLocalSearchParams();
  const bookId = Array.isArray(params.book) ? params.book[0] : params.book;
  const insightId = params.insight;
  const [insight, setInsight] = useState<Insight | null>(selectedBook && selectedBook.id.toString() === bookId && insightMap ? insightMap[insightId] : null);
  const [childInsights, setChildInsights] = useState<Insight[]>([]);
  const [isSelected, setIsSelected] = useState(false);

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

  const handleSavePress = () => {
    setIsSelected(!isSelected);
  };

  if (!insight) {
    return (
      <View style={styles.container}>
        <Text>Insight not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex: 1}} edges={['top']}>
      <ScrollView style={styles.container}>
        <QuizitButton />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{insight.title}</Text>
          {insight.leaf && (
            <View style={styles.saveContainer}>
            <SaveIcon
              isSelected={isSelected}
              onToggle={handleSavePress}
              size={30}
            />
            </View>
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
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  saveContainer: {
    height: 50,
    width: 50,
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
    marginBottom: 20,
    marginTop: 70,
    paddingHorizontal:70,
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
