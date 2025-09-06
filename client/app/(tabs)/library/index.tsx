import { View, StyleSheet, FlatList, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useCollections } from '../../../hooks/useCollections';
import { useSearch } from '../../../hooks/useSearch';
import LibraryHeader from '../../../components/library/LibraryHeader';
import SearchBar from '../../../components/library/SearchBar';
import FilterGroup from '../../../components/library/FilterGroup';
import BookRow from '../../../components/library/BookRow';
import SearchResults from '../../../components/search/SearchResults';
import SafeAreaWrapper from '../../../components/common/SafeAreaWrapper';

export default function LibraryScreen() {
  const { 
    collections, 
    loading, 
    loadingMore, 
    error, 
    loadMoreCollections 
  } = useCollections();

  const {
    searchQuery,
    searchResults,
    searchLoading,
    searchLoadingMore,
    searchError,
    hasMoreResults,
    isSearching,
    search,
    loadMoreResults,
    clearSearch
  } = useSearch();

  const renderCollectionRow = ({ item }: { item: any }) => {
    return (
      <BookRow
        title={item.title || 'Untitled Collection'}
        collectionId={item.id}
        onBookPress={handleBookPress}
      />
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>Loading more collections...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.emptyText}>Loading collections...</Text>
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
        <Text style={styles.emptyText}>No collections found</Text>
      </View>
    );
  };

  const handleBookPress = (book: any) => {
    router.push({
      pathname: '/library/book',
      params: {
        bookId: book.id,
        bookTitle: book.title,
        bookCover: book.cover,
        headerColor: book.header_color || '#3B82F6',
        backgroundEndColor: book.background_end_color || '#1E40AF',
        buttonTextBorderColor: book.button_text_border_color || '#6B7280',
        buttonCircleColor: book.button_circle_color || '#374151'
      }
    });
  };

  return (
    <SafeAreaWrapper backgroundColor="white">
      <View style={styles.container}>
        <LibraryHeader />
        <SearchBar 
          value={searchQuery}
          onChangeText={search}
          onClear={clearSearch}
          loading={searchLoading}
        />
        <FilterGroup />
        
        {isSearching ? (
          <SearchResults
            results={searchResults}
            loading={searchLoading}
            loadingMore={searchLoadingMore}
            error={searchError}
            hasMore={hasMoreResults}
            onLoadMore={loadMoreResults}
            onBookPress={handleBookPress}
          />
        ) : (
          <FlatList
            data={collections}
            renderItem={renderCollectionRow}
            keyExtractor={(item, index) => `collection-${item.id}-${index}`}
            onEndReached={loadMoreCollections}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            style={styles.content}
          />
        )}
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    paddingTop: 8,
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
