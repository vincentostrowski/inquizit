import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useBookDetails } from '../../../hooks/useBookDetails';
import { useViewMode } from '../../../context/ViewModeContext';
import { useQuizitConfig } from '../../../context/QuizitConfigContext';
import { includesId } from '../../../utils/idUtils';
import ContentHeader from '../../../components/common/ContentHeader';
import CoverDisplay from '../../../components/book/CoverDisplay';
import ContentDescription from '../../../components/common/ContentDescription';
import BookDisplayToggle from '../../../components/book/BookDisplayToggle';
import CardDisplay from '../../../components/book/CardDisplay';
import ListDisplay from '../../../components/book/ListDisplay';
import SkeletonCoverDisplay from '../../../components/book/SkeletonCoverDisplay';
import SkeletonDescription from '../../../components/common/SkeletonDescription';
import SkeletonCardDisplay from '../../../components/book/SkeletonCardDisplay';
import SkeletonListDisplay from '../../../components/book/SkeletonListDisplay';

export default function BookScreen() {
  const { 
    bookId, 
    bookTitle, 
    bookCover, 
    headerColor, 
    backgroundEndColor,
    buttonTextBorderColor, 
    buttonCircleColor 
  } = useLocalSearchParams();
  const { bookDetails, loading, error } = useBookDetails(bookId);
  const { viewMode, setViewMode } = useViewMode();
  const { showQuizitConfig, modalData, toggleCardSelection, pushToNavigationStack, popFromNavigationStack } = useQuizitConfig();
  
  // Get edit mode and selections from modal data
  const isEditMode = modalData?.isEditMode || false;
  const bookSelections = modalData?.bookSelections || [];
  
  // Get selected card IDs for current book
  const selectedCardIds = bookSelections.find(book => book.bookId === bookId)?.selectedCardIds || [];

  // Manage navigation stack
  useEffect(() => {
    if (bookId) {
      pushToNavigationStack(bookId as string);
      
      return () => {
        popFromNavigationStack(bookId as string);
      };
    }
  }, [bookId, pushToNavigationStack, popFromNavigationStack]);
  
  // Local filter state
  const [filterMode, setFilterMode] = useState<'all' | 'main' | 'saved'>('all');

  // Card filter states
  const [allCardIds, setAllCardIds] = useState<string[]>([]);
  const [mainCardIds, setMainCardIds] = useState<string[]>([]);
  const [savedCardIds, setSavedCardIds] = useState<string[]>([]);

  // Populate card IDs when book details load
  useEffect(() => {
    if (bookDetails?.sections) {
      // Flatten all cards from all sections
      const allCards = bookDetails.sections.flatMap((section: any) => section.cards);
      
      setAllCardIds(allCards.map((card: any) => card.id));
      setMainCardIds(allCards.filter((card: any) => card.isMain).map((card: any) => card.id));
      setSavedCardIds(allCards.filter((card: any) => card.isSaved).map((card: any) => card.id));
    }
  }, [bookDetails]);

  const handleBack = () => {
    router.back();
  };

  const handleStartQuizit = () => {
    // Get current filter's card IDs
    const currentCardIds = filterMode === 'all' ? allCardIds : 
                          filterMode === 'main' ? mainCardIds : savedCardIds;

    showQuizitConfig({
      screenType: 'book',
      bookCover: bookCover as string,
      title: bookTitle as string,
      isEditMode: false,
      bookSelections: [{
        bookId: bookId as string,
        bookTitle: bookTitle as string,
        bookCover: bookCover as string,
        selectedCardIds: currentCardIds,
        headerColor: headerColor as string || bookDetails?.book?.header_color || 'green',
        backgroundEndColor: backgroundEndColor as string || bookDetails?.book?.background_end_color || 'green',
        buttonTextBorderColor: buttonTextBorderColor as string || bookDetails?.book?.button_text_border_color || 'green',
        buttonCircleColor: buttonCircleColor as string || bookDetails?.book?.button_circle_color || 'green'
      }],
      onStartQuizit: () => {
        router.push({
          pathname: '/quizit',
          params: { quizitId: bookId, quizitTitle: bookTitle }
        });
      }
    });
  };

  const handleCheckConflicts = () => {
    console.log('Check for conflicts');
  };

  const handleViewPastQuizits = () => {
    console.log('View past quizits');
  };


  const handleCardPress = (card: any) => {
    router.push({
      pathname: '/library/card',
      params: {
        cardId: card.id,
        cardTitle: card.title,
        sectionId: card.section_id,
        sectionTitle: card.sectionTitle || 'Unknown Section',
        bookId: bookId as string,
        bookTitle: bookTitle as string,
        bookCover: bookCover as string,
        headerColor: headerColor as string || bookDetails?.book?.header_color || 'green',
        backgroundEndColor: backgroundEndColor as string || bookDetails?.book?.background_end_color || 'green',
        buttonTextBorderColor: buttonTextBorderColor as string || bookDetails?.book?.button_text_border_color || 'green',
        buttonCircleColor: buttonCircleColor as string || bookDetails?.book?.button_circle_color || 'green'
      }
    });
  };

  const handleCardSelection = (cardId: string) => {
    toggleCardSelection(
      bookId as string, 
      bookTitle as string, 
      bookCover as string, 
      cardId,
      {
        headerColor: headerColor as string || bookDetails?.book?.header_color || 'green',
        backgroundEndColor: backgroundEndColor as string || bookDetails?.book?.background_end_color || 'green',
        buttonTextBorderColor: buttonTextBorderColor as string || bookDetails?.book?.button_text_border_color || 'green',
        buttonCircleColor: buttonCircleColor as string || bookDetails?.book?.button_circle_color || 'green'
      }
    );
  };

  const handleSelectAll = (cardIds: string[]) => {
    // Check if all cards in this section are already selected
    const allSelected = cardIds.every(cardId => includesId(selectedCardIds, cardId));
    
    if (allSelected) {
      // Deselect all cards in this section
      cardIds.forEach(cardId => {
        if (includesId(selectedCardIds, cardId)) {
          toggleCardSelection(
            bookId as string, 
            bookTitle as string, 
            bookCover as string, 
            cardId,
            {
              headerColor: headerColor as string || bookDetails?.book?.header_color || 'green',
              backgroundEndColor: backgroundEndColor as string || bookDetails?.book?.background_end_color || 'green',
              buttonTextBorderColor: buttonTextBorderColor as string || bookDetails?.book?.button_text_border_color || 'green',
              buttonCircleColor: buttonCircleColor as string || bookDetails?.book?.button_circle_color || 'green'
            }
          );
        }
      });
    } else {
      // Select all unselected cards in this section
      cardIds.forEach(cardId => {
        if (!includesId(selectedCardIds, cardId)) {
          toggleCardSelection(
            bookId as string, 
            bookTitle as string, 
            bookCover as string, 
            cardId,
            {
              headerColor: headerColor as string || bookDetails?.book?.header_color || 'green',
              backgroundEndColor: backgroundEndColor as string || bookDetails?.book?.background_end_color || 'green',
              buttonTextBorderColor: buttonTextBorderColor as string || bookDetails?.book?.button_text_border_color || 'green',
              buttonCircleColor: buttonCircleColor as string || bookDetails?.book?.button_circle_color || 'green'
            }
          );
        }
      });
    }
  };

  const handleSelectAllCards = () => {
    // Get all cards based on current filter mode
    let currentCardIds: string[] = [];
    if (filterMode === 'all') {
      currentCardIds = allCardIds;
    } else if (filterMode === 'main') {
      currentCardIds = mainCardIds;
    } else if (filterMode === 'saved') {
      currentCardIds = savedCardIds;
    }
    
    handleSelectAll(currentCardIds);
  };

  const getFirstThreeCards = () => {
    if (!bookDetails?.sections) return [];
    
    const sectionCards = bookDetails.sections.flatMap((section: any) => 
      section.cards.map((card: any) => ({ 
        ...card, 
        sectionTitle: section.title 
      }))
    );
    
    const allCards = [...sectionCards];
    
    return allCards
      .filter((card: any) => card.banner && card.banner.trim() !== '') // Only cards with banners
      .sort((a: any, b: any) => (a.final_order || 0) - (b.final_order || 0))
      .slice(0, 3);
  };

  return (
    <View style={styles.container}>
      <ContentHeader
        onBack={handleBack}
        onStartQuizit={handleStartQuizit}
        onCheckConflicts={handleCheckConflicts}
        onViewPastQuizits={handleViewPastQuizits}
        headerColor={headerColor as string || bookDetails?.book?.header_color || 'green'}
        buttonTextBorderColor={buttonTextBorderColor as string || bookDetails?.book?.button_text_border_color || 'green'}
        buttonCircleColor={buttonCircleColor as string || bookDetails?.book?.button_circle_color || 'green'}
        isEditMode={isEditMode}
      />  
      
      {/* Growing view that expands in bounce space */}
      <View style={[styles.growingArea, { backgroundColor: headerColor as string || bookDetails?.book?.header_color || 'green' }]} />
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={[
          isEditMode && { paddingBottom: 200 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        ) : (
          <>
            {/* Cover Display - Skeleton or Real */}
            {loading ? (
              <SkeletonCoverDisplay
                headerColor={headerColor as string || '#3B82F6'}
                backgroundEndColor={backgroundEndColor as string || '#1E40AF'}
                showCards={false}
                cardSize="small"
              />
            ) : bookDetails?.book ? (
              <CoverDisplay
                cover={bookCover as string}
                headerColor={headerColor as string || bookDetails.book.header_color}
                backgroundEndColor={backgroundEndColor as string || bookDetails.book.background_end_color}
                cards={getFirstThreeCards()}
              />
            ) : null}

            {/* Description - Skeleton or Real */}
            {loading ? (
              <SkeletonDescription />
            ) : bookDetails?.book ? (
              <ContentDescription
                description={bookDetails.book.description || 'No description available'}
              />
            ) : null}

            {/* Display Toggle - Always show */}
        <BookDisplayToggle
          filterMode={filterMode}
          setFilterMode={setFilterMode}
          isEditMode={isEditMode}
          selectedCardIds={selectedCardIds}
          allCardIds={allCardIds}
          onSelectAll={handleSelectAllCards}
          loading={loading}
        />

            {/* Cards/List Display - Skeleton or Real */}
            {loading ? (
              viewMode === 'cards' ? (
                <SkeletonCardDisplay />
              ) : (
                <SkeletonListDisplay />
              )
            ) : bookDetails?.book ? (
              viewMode === 'cards' ? (
                <CardDisplay
                  sections={bookDetails.sections}
                  onCardPress={handleCardPress}
                  bookId={bookId as string}
                  bookTitle={bookTitle as string}
                  bookCover={bookCover as string}
                  headerColor={headerColor as string || bookDetails.book.header_color}
                  backgroundEndColor={backgroundEndColor as string || bookDetails.book.background_end_color}
                  buttonTextBorderColor={buttonTextBorderColor as string || bookDetails.book.button_text_border_color}
                  buttonCircleColor={buttonCircleColor as string || bookDetails.book.button_circle_color}
                  isEditMode={isEditMode}
                  selectedCardIds={selectedCardIds}
                  onCardSelection={handleCardSelection}
                  onSelectAll={handleSelectAll}
                />
              ) : (
                <ListDisplay
                  sections={bookDetails.sections}
                  onCardPress={handleCardPress}
                  bookId={bookId as string}
                  bookTitle={bookTitle as string}
                  bookCover={bookCover as string}
                  headerColor={headerColor as string || bookDetails.book.header_color}
                  backgroundEndColor={backgroundEndColor as string || bookDetails.book.background_end_color}
                  buttonTextBorderColor={buttonTextBorderColor as string || bookDetails.book.button_text_border_color}
                  buttonCircleColor={buttonCircleColor as string || bookDetails.book.button_circle_color}
                  isEditMode={isEditMode}
                  selectedCardIds={selectedCardIds}
                  onCardSelection={handleCardSelection}
                />
              )
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    zIndex: -3,
  },
  growingArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 500, // Large height to fill bounce space
    zIndex: -1, // Behind other content
  },
  content: {
    flex: 1,
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
});
