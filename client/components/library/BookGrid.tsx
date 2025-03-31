import { ScrollView, StyleSheet, FlatList } from "react-native";
import type { Book } from "../../data/types";
import { BookItem } from './BookItem';

interface BookGridProps {
  books: Book[];
}

export function BookGrid({ books }: BookGridProps) {
  return (
    <FlatList
      data={books}
      renderItem={({ item }) => <BookItem book={item} />}
      keyExtractor={item => item.id}
      numColumns={3}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false} 
      columnWrapperStyle={styles.row}
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  container: {
    flex: 1,
    padding: 16,
  },
});
