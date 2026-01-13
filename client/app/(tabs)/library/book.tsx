import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { useBookDetails } from '../../../hooks/useBookDetails';
import { useViewMode } from '../../../context/ViewModeContext';
import { useQuizitConfig } from '../../../context/QuizitConfigContext';
import { useAuth } from '../../../context/AuthContext';
import { includesId } from '../../../utils/idUtils';
import { savedItemsService } from '../../../services/savedItemsService';
import ContentHeader from '../../../components/common/ContentHeader';
import ContentOptionsModal from '../../../components/common/ContentOptionsModal';
import UnsaveBookConfirmationModal from '../../../components/common/UnsaveBookConfirmationModal';
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
  const { bookDetails, loading, error, updateBookSavedStatus, updateAllCardsSavedStatus, updateCardSavedStatus } = useBookDetails(bookId);
  const { viewMode, setViewMode, filterMode, setFilterMode } = useViewMode();
  const { showQuizitConfig, modalData, toggleCardSelection, pushToNavigationStack, popFromNavigationStack } = useQuizitConfig();
  const { user } = useAuth();
  
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

  // Card filter states
  const [allCardIds, setAllCardIds] = useState<string[]>([]);
  const [mainCardIds, setMainCardIds] = useState<string[]>([]);
  const [savedCardIds, setSavedCardIds] = useState<string[]>([]);

  // Section expansion state
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Modal states
  const [showContentOptionsModal, setShowContentOptionsModal] = useState(false);
  const [showUnsaveConfirmationModal, setShowUnsaveConfirmationModal] = useState(false);
  const [savedCardsCount, setSavedCardsCount] = useState(0);

  // Populate card IDs when book details load
  useEffect(() => {
    if (bookDetails?.sections) {
      // Flatten all cards from all sections
      const allCards = bookDetails.sections.flatMap((section: any) => section.cards);
      
      setAllCardIds(allCards.map((card: any) => card.id));
      setMainCardIds(allCards.filter((card: any) => card.isMain).map((card: any) => card.id));
      setSavedCardIds(allCards.filter((card: any) => card.isSaved).map((card: any) => card.id));

      // Initialize all sections as expanded
      const allSectionIds = bookDetails.sections.map((section: any) => section.id);
      setExpandedSections(new Set(allSectionIds));
    }
  }, [bookDetails]);

  // Sync book and card saved statuses when screen comes into focus
  // This ensures the saved status is up-to-date after returning from card screen
  useFocusEffect(
    useCallback(() => {
      const syncSavedStatuses = async () => {
        if (!user?.id || !bookId || !bookDetails) return;

        try {
          // Check book saved status
          const isSaved = await savedItemsService.isBookSaved(user.id, Number(bookId));
          // Only update if status changed
          if (isSaved !== bookDetails.book?.isSaved) {
            updateBookSavedStatus(isSaved);
          }

          // Check all cards saved statuses
          if (bookDetails.sections && bookDetails.sections.length > 0) {
            // Collect all card IDs
            const allCardIds = bookDetails.sections.flatMap((section: any) => 
              (section.cards || []).map((card: any) => Number(card.id))
            );

            if (allCardIds.length > 0) {
              // Batch check saved status for all cards
              const cardsStatusMap = await savedItemsService.getSavedStatusForCards(user.id, allCardIds);
              
              // Update each card's saved status if it changed
              // Check all cards, not just the ones in the map
              for (const section of bookDetails.sections) {
                for (const card of (section.cards || [])) {
                  const cardId = Number(card.id);
                  const isCardSaved = cardsStatusMap.get(cardId) || false;
                  const currentCardSaved = card.isSaved || false;
                  
                  // Only update if status changed
                  if (isCardSaved !== currentCardSaved) {
                    updateCardSavedStatus(cardId, isCardSaved);
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error('Error syncing saved statuses on focus:', err);
        }
      };

      syncSavedStatuses();
    }, [user?.id, bookId, bookDetails, updateBookSavedStatus, updateCardSavedStatus])
  );

  const handleBack = () => {
    router.back();
  };

  const handleStartQuizit = () => {
    // Get current filter's card IDs
    const currentCardIds = filterMode === 'all' ? allCardIds : 
                          filterMode === 'main' ? mainCardIds : savedCardIds;

    showQuizitConfig({
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
      isPairedMode: false,
      biasText: undefined
    });
  };

  const handleCheckConflicts = () => {
    console.log('Check for conflicts');
  };

  const handleViewPastQuizits = () => {
    console.log('View past quizits');
  };

  // Save/Unsave handlers
  const handleEllipsisPress = () => {
    setShowContentOptionsModal(true);
  };

  const handleSaveBook = async () => {
    if (!user?.id || !bookId) return;

    try {
      const { error } = await savedItemsService.saveBook(user.id, Number(bookId));
      if (error) {
        Alert.alert('Error', 'Failed to save book. Please try again.');
        return;
      }
      // Update local state directly
      updateBookSavedStatus(true);
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred.');
      console.error('Error saving book:', err);
    }
  };

  const handleUnsaveBook = async () => {
    if (!user?.id || !bookId) return;

    try {
      // Check if book has saved cards
      const count = await savedItemsService.getSavedCardsCount(user.id, Number(bookId));
      
      if (count > 0) {
        // Show confirmation modal
        setSavedCardsCount(count);
        setShowUnsaveConfirmationModal(true);
      } else {
        // No saved cards, proceed with unsave
        await performUnsaveBook();
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred.');
      console.error('Error checking saved cards count:', err);
    }
  };

  const performUnsaveBook = async () => {
    if (!user?.id || !bookId) return;

    try {
      const { error } = await savedItemsService.unsaveBook(user.id, Number(bookId), { unsaveCards: true });
      if (error) {
        Alert.alert('Error', 'Failed to unsave book. Please try again.');
        return;
      }
      // Update local state directly - unsave book and all cards
      updateBookSavedStatus(false);
      updateAllCardsSavedStatus(false);
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred.');
      console.error('Error unsaving book:', err);
    }
  };

  const handleContentOptionsSave = () => {
    if (bookDetails?.book?.isSaved) {
      handleUnsaveBook();
    } else {
      handleSaveBook();
    }
  };

  const handleContentOptionsUnsave = () => {
    handleUnsaveBook();
  };

  const handleConfirmUnsave = () => {
    performUnsaveBook();
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

  // Section expansion handlers
  const handleToggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleExpandAllSections = () => {
    if (bookDetails?.sections) {
      const allSectionIds = bookDetails.sections.map((section: any) => section.id);
      setExpandedSections(new Set(allSectionIds));
    }
  };

  const handleCollapseAllSections = () => {
    setExpandedSections(new Set());
  };

  // Check if all sections are expanded
  const isAllSectionsExpanded = bookDetails?.sections ? 
    bookDetails.sections.every((section: any) => expandedSections.has(section.id)) : false;

  // Filter sections based on filterMode
  const filteredSections = useMemo(() => {
    if (!bookDetails?.sections) return [];

    if (filterMode === 'all') {
      // Show all cards
      return bookDetails.sections;
    } else if (filterMode === 'main') {
      // Show only main cards
      return bookDetails.sections
        .map((section: any) => ({
          ...section,
          cards: (section.cards || []).filter((card: any) => card.isMain)
        }))
        .filter((section: any) => section.cards.length > 0);
    } else if (filterMode === 'saved') {
      // Show only saved cards
      return bookDetails.sections
        .map((section: any) => ({
          ...section,
          cards: (section.cards || []).filter((card: any) => card.isSaved)
        }))
        .filter((section: any) => section.cards.length > 0);
    }
    
    return bookDetails.sections;
  }, [bookDetails?.sections, filterMode]);

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
        onEllipsisPress={handleEllipsisPress}
        headerColor={headerColor as string || bookDetails?.book?.header_color || 'green'}
        buttonTextBorderColor={buttonTextBorderColor as string || bookDetails?.book?.button_text_border_color || 'green'}
        buttonCircleColor={buttonCircleColor as string || bookDetails?.book?.button_circle_color || 'green'}
        isEditMode={isEditMode}
      />

      {/* Content Options Modal */}
      <ContentOptionsModal
        visible={showContentOptionsModal}
        contentType="book"
        isSaved={bookDetails?.book?.isSaved || false}
        onClose={() => setShowContentOptionsModal(false)}
        onSave={handleContentOptionsSave}
        onUnsave={handleContentOptionsUnsave}
      />

      {/* Unsave Confirmation Modal */}
      <UnsaveBookConfirmationModal
        visible={showUnsaveConfirmationModal}
        savedCardsCount={savedCardsCount}
        onClose={() => setShowUnsaveConfirmationModal(false)}
        onConfirm={handleConfirmUnsave}
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
            {/* Cover Display - Always show immediately */}
            <CoverDisplay
              cover={bookCover as string}
              headerColor={headerColor as string || bookDetails?.book?.header_color || '#3B82F6'}
              backgroundEndColor={backgroundEndColor as string || bookDetails?.book?.background_end_color || '#1E40AF'}
              cards={loading ? [] : getFirstThreeCards()}
            />

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
          isEditMode={isEditMode}
          selectedCardIds={selectedCardIds}
          allCardIds={allCardIds}
          onSelectAll={handleSelectAllCards}
          loading={loading}
          viewMode={viewMode}
          filterMode={filterMode}
          isAllSectionsExpanded={isAllSectionsExpanded}
          onExpandAllSections={handleExpandAllSections}
          onCollapseAllSections={handleCollapseAllSections}
        />

            {/* Cards/List Display - Skeleton or Real */}
            {loading ? (
              viewMode === 'cards' ? (
                <SkeletonCardDisplay />
              ) : (
                <SkeletonListDisplay />
              )
            ) : bookDetails?.book ? (
              filteredSections.length > 0 ? (
                viewMode === 'cards' ? (
                  <CardDisplay
                    sections={filteredSections}
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
                    sections={filteredSections}
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
                    expandedSections={expandedSections}
                    onToggleSection={handleToggleSection}
                  />
                )
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {filterMode === 'saved' 
                      ? 'No saved cards' 
                      : filterMode === 'main' 
                      ? 'No main cards' 
                      : 'No cards available'}
                  </Text>
                </View>
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
});
