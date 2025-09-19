import { View, StyleSheet, FlatList, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useCollections } from '../../../hooks/useCollections';
import { useSearch } from '../../../hooks/useSearch';
import { useQuizitConfig } from '../../../context/QuizitConfigContext';
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

  const { modalData, toggleEditMode, navigationStack, showQuizitConfig, pushToNavigationStack, popFromNavigationStack } = useQuizitConfig();
  const isEditMode = modalData?.isEditMode || false;
  const [shouldShowBackButton, setShouldShowBackButton] = useState(false);

  useEffect(() => {
    setShouldShowBackButton(navigationStack.length > 0);
  }, []);

  // Manage navigation stack - add library if not root screen
  useEffect(() => {
    if (navigationStack.length > 0) {
      pushToNavigationStack('library');
      
      return () => {
        popFromNavigationStack('library');
      };
    }
  }, []);

  const handleBackPress = () => {
    router.back();
  };

  const handleStartQuizit = () => {
    showQuizitConfig({
      title: 'Custom List',
      isEditMode: false,
      bookSelections: [], // Empty for library start
      isPairedMode: false,
      biasText: undefined
    });
  };

  // No need to push library to navigation stack - it's the default starting point

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

        {/* Start Quizit Session Button */}
        {!shouldShowBackButton && !isEditMode && (
          <TouchableOpacity 
            style={styles.startQuizitButton}
            onPress={handleStartQuizit}
            activeOpacity={0.85}
          >
            <Text style={styles.startQuizitText}>
              Start Quizit{'\n'}Session
            </Text>
            <View style={styles.startQuizitButtonCircle}>
              <Ionicons name="document-text" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}

    
        <View style={styles.searchContainer}>
          {shouldShowBackButton && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBackPress}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#1D1D1F" />
            </TouchableOpacity>
          )}
          <SearchBar 
            value={searchQuery}
            onChangeText={search}
            onClear={clearSearch}
          />
        </View>
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
            isEditMode={isEditMode}
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
            contentContainerStyle={isEditMode ? { paddingBottom: 150 } : undefined}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  startQuizitButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    padding: 6,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 100,
    opacity: 0.9,
  },
  startQuizitButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#636366',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  startQuizitText: {
    color: '#636366',
    fontSize: 11,
    textAlign: 'right',
    lineHeight: 13,
    fontWeight: '500',
    paddingLeft: 8,
  },
});
