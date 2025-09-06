import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useBooks } from '../../hooks/useBooks';
import { Book } from '../../types/books';
import BookRowItem from './BookRowItem';

interface BookRowProps {
  title: string;
  collectionId: number;
  onBookPress?: (book: Book) => void;
}

export default function BookRow({ title, collectionId, onBookPress }: BookRowProps) {
  const { books, loading, error, loadingMore, hasMore, loadMoreBooks } = useBooks(collectionId);

  return (
    <View style={styles.container}>
      <Text style={styles.rowTitle}>{title}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        onScroll={(event) => {
          const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
          const isCloseToRight = contentOffset.x + layoutMeasurement.width >= contentSize.width - 50;
          
          if (isCloseToRight && hasMore && !loadingMore) {
            loadMoreBooks();
          }
        }}
        scrollEventThrottle={400}
      >
        <View style={styles.bookContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load books</Text>
            </View>
          ) : books.length > 0 ? (
            <>
              {books.map((book: Book) => (
                <BookRowItem
                  key={book.id}
                  book={book}
                  onPress={onBookPress}
                />
              ))}
              {loadingMore && (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="small" color="#007AFF" />
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No books found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  rowTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  bookContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  loadingContainer: {
    width: 100,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMoreContainer: {
    width: 100,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  errorContainer: {
    width: 100,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: 10,
    color: '#DC2626',
    textAlign: 'center',
  },
  emptyContainer: {
    width: 100,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
});
