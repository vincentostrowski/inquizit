import { View, Text, StyleSheet, Image, ScrollView, Dimensions} from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "../../../config/supabase";
import { ExpandCollapse } from "../../../components/insightList/toggles/ExpandCollapse";
import { InsightList } from "../../../components/insightList/InsightList";
import { LoadingInsightList } from "../../../components/insightList/LoadingInsightList";
import type { Book, Insight } from "../../../data/types";
import { useBook } from "../../../data/bookContext";
import { TopBar } from "../../../components/universal/topbar/TopBar";
import { useAuth } from "../../../data/authContext";
import { ProgressBar } from "../../../components/universal/progressBar";

export default function BookScreen() {
  const { user } = useAuth();
  const userId = user?.id;
  const { selectedBook, insightTree, insightMap, setInsightTree, setInsightMap } = useBook();
  const { book: bookIdParam } = useLocalSearchParams();
  const bookId = parseInt(Array.isArray(bookIdParam) ? bookIdParam[0] : bookIdParam, 10);  
  const [book, setBook] = useState<Book | null>((selectedBook && selectedBook.id === bookId) ? selectedBook : null);
  const [insights, setInsights] = useState<Insight[]>(insightTree);
  const [expandedRows, setExpandedRows] = useState<number>(1);
  const [rootLoaded, setRootLoaded] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const { width } = Dimensions.get('window');
  const COVER_WIDTH = width * 0.5; // Half the screen width
  const COVER_HEIGHT = COVER_WIDTH * 1.5; // Aspect ratio of 2:3
  const [insightCount, setInsightCount] = useState({saved: 0, total: 0});
  const [fractionSaved, setFractionSaved] = useState(0);
  
  // If book not already loaded by library selection, load the book + insight structures
  useEffect(() => {
    const loadRootInsights = async () => {
      let {data: Insights, error} = await supabase.from('book_insights_with_saved_state').select('*').eq('bookId', bookId).is('parentId', null).order('order', { ascending: true });
      setInsights(Insights || []);
      setRootLoaded(true);
    };
    
    const loadBook = async () => {
      let {data: fetchedBook, error} = await supabase.from('Book').select('*').eq('id', bookId).single();  
      setBook(fetchedBook); 
    };

    if (!book) {
      //No book in context or URL book does not match book in context, so reset context
      loadBook();
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
      let {data: allInsights, error} = await supabase.from('book_insights_with_saved_state').select('*').eq('bookId', book.id).order('order', { ascending: true });
      const { tree, map } = buildInsightTreeAndMap(allInsights);
      setInsights(tree || []);
      setAllLoaded(true);
      setInsightTree(tree);
      setInsightMap(map);
    };
    loadAllInsights();
  }, [rootLoaded])

  useEffect(() => {
    if (!insightTree || insightTree.length === 0) return;
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
    
      for (const insight of insightTree) {
        if (insightMap && insightMap[insight.id]) {
          // Perform DFS starting from the root insight 
          const result = DFS(insightMap[insight.id]);
          total += result.total;
          saved += result.saved;
        }
      }
      setInsightCount({saved, total});
      // Return the fraction of saved insights
      return total > 0 ? saved / total : 0;
    }

    const savedFraction = computeSavedFraction();

    setFractionSaved(savedFraction);
  }, [insightTree]);

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
    <SafeAreaView style={{flex: 1, backgroundColor: '#dfdfdf'}} edges={['top']}>
      <TopBar book={book} insight={null} insightCount={insightCount}/>
      <ScrollView 
        style={styles.container}
      >
        <View style={styles.coverContainer}>
          <Image 
            source={{ uri: book.coverURL }}
            style={[styles.cover, {width: COVER_WIDTH, height: COVER_HEIGHT}]}
            resizeMode="cover"
          />
          <View style={[styles.progressContainer, {width: COVER_WIDTH}]}>
            <ProgressBar fraction={fractionSaved}/>
          </View>
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
            userId={userId}
          />)}
        {
          rootLoaded && !allLoaded && (
            <LoadingInsightList 
            insights={insights}
            onInsightPress={handleInsightPress}
            expand={expandedRows}
            setExpandedStart={setExpandedRows}
            userId={userId}
          />)
        }
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  coverContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  progressContainer: {
    paddingTop: 10,
    paddingHorizontal: 5,
  },
  cover: {
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
    paddingHorizontal: 25,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5E5',
  },
});
