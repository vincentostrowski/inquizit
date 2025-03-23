import { View, Text, StyleSheet, Image, ScrollView, Dimensions } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { QuizitButton } from "../../../components/QuizitButton";
import { InsightList } from "../../../components/insights/InsightList";
import { getBookById } from "../../../data/books";
import { getRootInsights } from "../../../data/insights";
import type { Book, Insight } from "../../../data/types";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');
const COVER_WIDTH = width * 0.5; // Half the screen width
const COVER_HEIGHT = COVER_WIDTH * 1.5; // 3:2 aspect ratio to match explore view

export default function BookScreen() {
  const { book: bookId } = useLocalSearchParams();
  const [book, setBook] = useState<Book | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    if (typeof bookId === 'string') {
      const foundBook = getBookById(bookId);
      setBook(foundBook || null);
      
      if (foundBook) {
        const bookInsights = getRootInsights(foundBook._id);
        setInsights(bookInsights);
      }
    }
  }, [bookId]);

  const handleInsightPress = (insight: Insight) => {
    if (book?._id) {
      router.push({
        pathname: "/library/[book]/[insight]",
        params: { book: book._id, insight: insight._id}
      });
    }
  };

  if (!book) {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.title}>Book not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QuizitButton />
      <ScrollView style={styles.container}>
        <View style={styles.coverContainer}>
          <Image 
            source={{ uri: book.coverUrl }}
            style={styles.cover}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.description}>{book.description}</Text>
        <InsightList 
          insights={insights}
          onInsightPress={handleInsightPress}
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
  coverContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cover: {
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    color: '#333',
  },
});
