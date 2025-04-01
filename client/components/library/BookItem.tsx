import { Text, Image, StyleSheet, Dimensions, Pressable } from 'react-native';
import { router } from 'expo-router';
import type { Book, Insight } from "../../data/types";
import { useBook } from "../../data/bookContext";
import { supabase } from "../../config/supabase";

type Props = {
  book: Book;
}

// Calculate item width based on screen width and 3 columns
const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const PADDING = 8;
const itemWidth = (width - (PADDING * 2 * COLUMN_COUNT)) / COLUMN_COUNT;

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

export function BookItem({ book }: Props) {
  const { selectedBook, setSelectedBook, setInsightTree, setInsightMap } = useBook();

  const loadAllInsights = async () => {
    setInsightTree([]);
    setInsightMap({});
    let {data: allInsights, error} = await supabase.from('book_insights_with_saved_state').select('*').eq('bookId', book.id);
    if (allInsights && allInsights.length > 0) {
      const { tree, map } = buildInsightTreeAndMap(allInsights);
      setInsightTree(tree);
      setInsightMap(map);
    } 
    if (error) {
      console.error('Error fetching insights:', error.message);
    }
  };

  return (
    <Pressable 
      style={styles.container}
      onPress={async () => {
        if (!selectedBook || selectedBook.id != book.id) {
          await loadAllInsights();
          setSelectedBook(book);
        }

        router.push({
          pathname: "/library/[book]",  
          params: {book: book.id }
      })}}
    >
      <Image 
        source={{ uri: book.coverURL }}
        style={styles.cover}
        resizeMode="cover"
      />
      <Text style={styles.title} numberOfLines={2}>
        {book.title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: itemWidth,
    padding: PADDING,
    alignItems: 'center',
  },
  cover: {
    width: itemWidth - (PADDING * 2),
    height: (itemWidth - (PADDING * 2)) * 1.5, // 3:2 aspect ratio
    borderRadius: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});
