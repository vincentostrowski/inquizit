import { View, StyleSheet, FlatList } from "react-native";
import type { Book } from "../../data/types";
import { BookItem } from './BookItem';

interface BookGridProps {
  books: Book[];
}

export function BookGrid({ books }: BookGridProps) {
  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={({ item }) => <BookItem book={item} />}
        keyExtractor={item => item._id}
        numColumns={3}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  row: {
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
});
