import { View, Text, StyleSheet, Image, ScrollView, Dimensions} from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "../../../config/supabase";
import { QuizitButton } from "../../../components/QuizitButton";
import { ExpandCollapse } from "../../../components/book/ExpandCollapse";
import { InsightList } from "../../../components/insights/InsightList";
import { LoadingInsightList } from "../../../components/insights/LoadingInsightList";
import type { Book, Insight } from "../../../data/types";
import { useBook } from "../../../data/bookContext";

const { width } = Dimensions.get('window');
const COVER_WIDTH = width * 0.5; // Half the screen width
const COVER_HEIGHT = COVER_WIDTH * 1.5; // 3:2 aspect ratio to match explore view

export default function BookScreen() {
  const { selectedBook, insightTree, setInsightTree, setInsightMap } = useBook();

  const { book: bookIdParam } = useLocalSearchParams();
  const bookId = parseInt(Array.isArray(bookIdParam) ? bookIdParam[0] : bookIdParam, 10);  
  const [book, setBook] = useState<Book | null>((selectedBook && selectedBook.id === bookId) ? selectedBook : null);

  const [insights, setInsights] = useState<Insight[]>([]);
  const [expandedRows, setExpandedRows] = useState<number>(1);
  const [rootLoaded, setRootLoaded] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  
  useEffect(() => {
    const loadRootInsights = async () => {
      let {data: Insights, error} = await supabase.from('Insight').select('*').eq('bookId', bookId).is('parentId', null);
      setInsights(Insights || []);
      setRootLoaded(true);
    };
    const loadBook = async () => {
      let {data: fetchedBook, error} = await supabase.from('Book').select('*').eq('id', bookId).single();  
      setBook(fetchedBook); 
    };
    if (!book) {
      loadBook();
      //if book is not already loaded, then the loaded insights are not relevant
      setInsightTree([]);
      setInsightMap({});
    }
    if (insightTree && insightTree.length > 0) {
      setInsights(insightTree);
      setAllLoaded(true);
    } else {
      loadRootInsights();
    }
  }, [bookId]);

  useEffect(() => {
    if (!rootLoaded) return;
    const loadAllInsights = async () => {
      let {data: allInsights, error} = await supabase.from('Insight').select('*').eq('bookId', book.id);
      const { tree, map } = buildInsightTreeAndMap(allInsights);
      setInsights(tree || []);
      setAllLoaded(true);
      setInsightTree(tree);
      setInsightMap(map);
    };
    loadAllInsights();
  }, [rootLoaded])

  const collapseRows = () => {
    setExpandedRows(1);
  }

  const expandRows = () => {
    setExpandedRows(2);
  }

  function buildInsightTreeAndMap(allInsights: Insight[]) {
    const map: Record<string, Insight> = {};
    const tree: Insight[] = [];
  
    allInsights.forEach((insight) => {
      map[insight.id] = { ...insight, children: [] };
    });
  
    allInsights.forEach((insight) => {
      if (insight.parentId) {
        map[insight.parentId]?.children.push(map[insight.id]);
      } else {
        tree.push(map[insight.id]);
      }
    });
    return {tree, map};
  }

  const handleInsightPress = (insight: Insight) => {
    if (book?.id) {
      router.push({
        pathname: "/library/[book]/[insight]",
        params: { book: book.id, insight: insight.id}
      });
    }
  };

  if (!book) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Book not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex: 1 }} edges={['top']}>
      <ScrollView style={styles.container}>
        <QuizitButton />
        <View style={styles.coverContainer}>
          <Image 
            source={{ uri: book.coverURL }}
            style={styles.cover}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.description}>{book.description}</Text>
        <ExpandCollapse collapse={collapseRows} expand={expandRows} />
        <View style={styles.separator} />
        {allLoaded && (
          <InsightList 
            insights={insights}
            onInsightPress={handleInsightPress}
            indent={0}
            expand={expandedRows}
            setExpandedStart={setExpandedRows}
          />)}
        {
          rootLoaded && !allLoaded && (
            <LoadingInsightList 
            insights={insights}
            onInsightPress={handleInsightPress}
            expand={expandedRows}
            setExpandedStart={setExpandedRows}
          />)
        }
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  coverContainer: {
    alignItems: 'center',
    marginTop: 60,
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
    paddingHorizontal: 60,
    paddingBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 30,
    color: '#333',
    textAlign: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5E5',
  },
});
