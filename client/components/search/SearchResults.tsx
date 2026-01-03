import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import BookRowItem from '../library/BookRowItem';
import { Book } from '../../types/books';

interface SearchResultsProps {
  results: Book[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
  onBookPress?: (book: Book) => void;
  isEditMode?: boolean;
}

export default function SearchResults({ 
  results, 
  loading, 
  loadingMore, 
  error, 
  hasMore, 
  onLoadMore, 
  onBookPress,
  isEditMode = false
}: SearchResultsProps) {
  // Group books into rows of 3
  const groupBooksIntoRows = (books: Book[]): Book[][] => {
    const rows: Book[][] = [];
    for (let i = 0; i < books.length; i += 3) {
      rows.push(books.slice(i, i + 3));
    }
    return rows;
  };

  const bookRows = groupBooksIntoRows(results);

  const renderBookRow = ({ item }: { item: Book[] }) => (
    <View style={styles.bookRow}>
      {item.map((book, index) => (
        <View key={book.id} style={styles.bookColumn}>
          <BookRowItem
            book={book}
            onPress={onBookPress}
          />
        </View>
      ))}
      {/* Fill empty slots if row is not complete */}
      {item.length < 3 && Array.from({ length: 3 - item.length }).map((_, index) => (
        <View key={`empty-${index}`} style={styles.bookColumn} />
      ))}
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        {/* <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>Loading more books...</Text> */}
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.emptyText}>Searching books...</Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No books found</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={bookRows}
        renderItem={renderBookRow}
        keyExtractor={(item, index) => `search-row-${index}`}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        style={styles.resultsList}
        contentContainerStyle={isEditMode ? { paddingBottom: 150 } : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  resultsList: {
    flex: 1,
  },
  bookRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  bookColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  bookItem: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  collectionName: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    marginLeft: 4,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
});
