import { View, Text, StyleSheet, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { insights, getInsightsByParentId } from "../../../../data/insights";
import type { Insight } from "../../../../data/types";
import { QuizitButton } from "../../../../components/QuizitButton";
import { useState, useEffect } from "react";
import { InsightList } from "../../../../components/insights/InsightList";
import { SaveIcon } from "@/components/insights/SaveIcon";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InsightScreen() {
  const params = useLocalSearchParams();
  const bookId = Array.isArray(params.book) ? params.book[0] : params.book;
  const insightId = params.insight;
  const insight = insights.find((i: Insight) => i._id === insightId);
  const [childInsights, setChildInsights] = useState<Insight[]>([]);
  const [isSelected, setIsSelected] = useState(false);

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
    <SafeAreaView style={{ flex: 1 }}>
      <QuizitButton />
      <ScrollView style={styles.container}>
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
        <View style={styles.separator} />
        <InsightList 
          insights={childInsights}
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
    padding: 10,
    paddingTop: 20,
  },
  saveContainer: {
    height: 50,
    width: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 0,
    paddingHorizontal: 60,
    textAlign: 'center',
  },
  titleContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    color: '#333',
    paddingHorizontal: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginLeft: 5,
  },
});
