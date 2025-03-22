import { View, Text, StyleSheet, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { insights, getInsightsByParentId } from "../../../../data/insights";
import type { Insight } from "../../../../data/types";
import { QuizitButton } from "../../../../components/QuizitButton";
import { useState, useEffect } from "react";
import { InsightList } from "../../../../components/insights/InsightList";

export default function InsightScreen() {
  const params = useLocalSearchParams();
  const bookId = Array.isArray(params.book) ? params.book[0] : params.book;
  const insightId = params.insight;
  const insight = insights.find((i: Insight) => i._id === insightId);
  const [childInsights, setChildInsights] = useState<Insight[]>([]);

  useEffect(() => {
    if (insight?._id) {
      const childInsights = getInsightsByParentId(insight._id);
      setChildInsights(childInsights);
    }
  }, [insight]);

  const handleInsightPress = (insight: Insight) => {
      router.push({
        pathname: "/library/[book]/[insight]",
        params: { 
          book: bookId,
          insight: insight._id
        },
      },);
    };

  if (!insight) {
    return (
      <View style={styles.container}>
        <Text>Insight not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <QuizitButton />
      <ScrollView style={styles.container}>
        <Text style={styles.title}>{insight.title}</Text>
        {insight.body.map((paragraph: string, index: number) => (
          <Text key={index} style={styles.paragraph}>{paragraph}</Text>
        ))}
        <InsightList 
          insights={childInsights}
          onInsightPress={handleInsightPress}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 10,
    paddingTop: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    color: '#333',
  },
});
