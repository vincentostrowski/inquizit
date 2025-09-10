import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useViewMode } from '../../../context/ViewModeContext';
import { useBookDetails } from '../../../hooks/useBookDetails';
import { useQuizitConfig } from '../../../context/QuizitConfigContext';
import { includesId, compareIds } from '../../../utils/idUtils';
import ContentHeader from '../../../components/common/ContentHeader';
import SectionDisplay from '../../../components/section/SectionDisplay';
import ContentDescription from '../../../components/common/ContentDescription';
import DisplayToggle from '../../../components/section/DisplayToggle';
import SectionCardDisplay from '../../../components/section/SectionCardDisplay';
import SectionListDisplay from '../../../components/section/SectionListDisplay';
import SkeletonSectionDisplay from '../../../components/section/SkeletonSectionDisplay';
import SkeletonDescription from '../../../components/common/SkeletonDescription';
import SkeletonSectionCardDisplay from '../../../components/section/SkeletonSectionCardDisplay';
import SkeletonSectionListDisplay from '../../../components/section/SkeletonSectionListDisplay';

export default function SectionScreen() {
  const { 
    sectionId, 
    sectionTitle, 
    bookId, 
    bookTitle, 
    bookCover,
    headerColor, 
    backgroundEndColor,
    buttonTextBorderColor, 
    buttonCircleColor 
  } = useLocalSearchParams();
  const { viewMode, setViewMode } = useViewMode();
  const { bookDetails, loading, error } = useBookDetails(bookId);
  const { showQuizitConfig, toggleCardSelection, pushToNavigationStack, popFromNavigationStack } = useQuizitConfig();
  
  // Local filter state
  const [filterMode, setFilterMode] = useState<'all' | 'saved'>('all');

  // Manage navigation stack
  useEffect(() => {
    if (bookId) {
      pushToNavigationStack(bookId as string);
      
      return () => {
        popFromNavigationStack(bookId as string);
      };
    }
  }, [bookId, pushToNavigationStack, popFromNavigationStack]);

  // Card filter states
  const [allCardIds, setAllCardIds] = useState<string[]>([]);
  const [savedCardIds, setSavedCardIds] = useState<string[]>([]);

  // Populate card IDs when book details load
  useEffect(() => {
    if (bookDetails?.sections) {
      // Find the current section and get its cards only
      const currentSection = bookDetails.sections.find(section => 
        section.id === sectionId || 
        section.id === String(sectionId) || 
        String(section.id) === sectionId
      );
      
      if (currentSection?.cards) {
        const sectionCards = currentSection.cards;
        
        setAllCardIds(sectionCards.map((card: any) => card.id));
        setSavedCardIds(sectionCards.filter((card: any) => card.isSaved).map((card: any) => card.id));
      }
    }
  }, [bookDetails, sectionId]);

  const handleBack = () => {
    router.back();
  };

  const handleStartQuizit = () => {
    // Get current filter's card IDs
    const currentCardIds = filterMode === 'all' ? allCardIds : savedCardIds;

    showQuizitConfig({
      screenType: 'section',
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
          params: { 
            quizitId: sectionId,
            quizitType: 'section',
            quizitTitle: sectionTitle
          }
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

  // Get modal data for edit mode
  const { modalData } = useQuizitConfig();
  const isEditMode = modalData?.isEditMode || false;
  const bookSelections = modalData?.bookSelections || [];
  console.log('Book selections:', bookSelections);
  const selectedCardIds = bookSelections.find(book => book.bookId === bookId)?.selectedCardIds || [];

  console.log('Selected card IDs:', selectedCardIds);
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
    const allSelected = cardIds.every(cardId => includesId(selectedCardIds, cardId));
    
    if (allSelected) {
      // Deselect all cards in this section
      const cardsToDeselect = cardIds.filter(cardId => includesId(selectedCardIds, cardId));
      cardsToDeselect.forEach(cardId => {
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
      });
    } else {
      // Select all unselected cards in this section
      const cardsToSelect = cardIds.filter(cardId => !includesId(selectedCardIds, cardId));
      cardsToSelect.forEach(cardId => {
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
      });
    }
  };

  const handleSelectAllCards = () => {
    // Get all cards based on current filter mode
    let currentCardIds: string[] = [];
    if (filterMode === 'all') {
      currentCardIds = allCardIds;
    } else if (filterMode === 'saved') {
      currentCardIds = savedCardIds;
    }
    
    handleSelectAll(currentCardIds);
  };

  const handleCardPress = (card: any) => {
    router.push({
      pathname: '/library/card',
      params: { 
        cardId: card.id, 
        cardTitle: card.title,
        sectionId,
        sectionTitle,
        bookId,
        bookTitle,
        bookCover,
        headerColor: headerColor as string || bookDetails?.book?.header_color || '#1D1D1F',
        backgroundEndColor: backgroundEndColor as string || bookDetails?.book?.background_end_color || '#1E40AF',
        buttonTextBorderColor: buttonTextBorderColor as string || bookDetails?.book?.button_text_border_color || '#FFFFFF',
        buttonCircleColor: buttonCircleColor as string || bookDetails?.book?.button_circle_color || '#FFFFFF'
      }
    });
  };

  // Find the section and get its cards
  // Handle both string and number comparison for sectionId
  const currentSection = bookDetails?.sections?.find(section => 
    compareIds(section.id, sectionId)
  );
  const currentSectionTitle = currentSection?.title || (sectionTitle as string) || 'Section';
  const sectionCards = currentSection?.cards || [];
  

  const getFirstThreeCards = () => {
    return sectionCards
      .filter((card: any) => card.banner && card.banner.trim() !== '') // Only cards with banners
      .slice(0, 3);
  };

  return (
    <View style={styles.container}>
      <ContentHeader
        onBack={handleBack}
        onStartQuizit={handleStartQuizit}
        onCheckConflicts={handleCheckConflicts}
        onViewPastQuizits={handleViewPastQuizits}
        headerColor={headerColor as string || bookDetails?.book?.header_color || '#1D1D1F'}
        buttonTextBorderColor={buttonTextBorderColor as string || bookDetails?.book?.button_text_border_color || '#FFFFFF'}
        buttonCircleColor={buttonCircleColor as string || bookDetails?.book?.button_circle_color || '#FFFFFF'}
      />
      
      {/* Growing view that expands in bounce space */}
      <View style={[styles.growingArea, { backgroundColor: headerColor as string || bookDetails?.book?.header_color || '#1D1D1F' }]} />
      
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
            {/* Section Display - Skeleton or Real */}
            {loading ? (
              <SkeletonSectionDisplay
                headerColor={headerColor as string || '#1D1D1F'}
                backgroundEndColor={backgroundEndColor as string || '#1E40AF'}
              />
            ) : (
              <SectionDisplay
                headerColor={headerColor as string || bookDetails?.book?.header_color || '#1D1D1F'}
                backgroundEndColor={backgroundEndColor as string || bookDetails?.book?.background_end_color || '#1E40AF'}
                cards={getFirstThreeCards()}
              />
            )}

            {/* Section Title - Skeleton or Real */}
            {!loading && currentSection && (
              <Text style={styles.sectionTitle}>{currentSectionTitle}</Text>
            )}

            {/* Description - Skeleton or Real */}
            {loading ? (
              <SkeletonDescription />
            ) : currentSection ? (
              <ContentDescription
                description={currentSection.description}
              />
            ) : null}

            {/* Display Toggle - Always show */}
             <DisplayToggle 
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
                <SkeletonSectionCardDisplay />
              ) : (
                <SkeletonSectionListDisplay />
              )
            ) : currentSection && sectionCards.length > 0 ? (
              viewMode === 'cards' ? (
                <SectionCardDisplay
                  cards={sectionCards}
                  onCardPress={handleCardPress}
                  isEditMode={isEditMode}
                  selectedCardIds={selectedCardIds}
                  onCardSelection={handleCardSelection}
                />
              ) : (
                <SectionListDisplay
                  cards={sectionCards.map((card, index) => ({
                    id: card.id,
                    title: card.title,
                    isBookmarked: index > 0,
                  }))}
                  onCardPress={handleCardPress}
                  isEditMode={isEditMode}
                  selectedCardIds={selectedCardIds}
                  onCardSelection={handleCardSelection}
                />
              )
            ) : !loading && currentSection ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No cards available in this section</Text>
              </View>
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
  sectionTitleContainer: {
    paddingHorizontal: 20,
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
    textAlign: 'center',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 64,
    paddingBottom: 8,
  },
});
