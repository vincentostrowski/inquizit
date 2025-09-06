import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useBookDetails } from '../../../hooks/useBookDetails';
import { useViewMode } from '../../../context/ViewModeContext';
import ContentHeader from '../../../components/common/ContentHeader';
import CoverDisplay from '../../../components/book/CoverDisplay';
import ContentDescription from '../../../components/common/ContentDescription';
import DisplayToggle from '../../../components/section/DisplayToggle';
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

  const handleBack = () => {
    router.back();
  };

  const handleStartQuizit = () => {
    router.push({
      pathname: '/quizit',
      params: { quizitId: bookId }
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
      pathname: './card',
      params: {
        cardId: card.id,
        cardTitle: card.title,
        sectionId: card.section_id,
        sectionTitle: card.sectionTitle || 'Unknown Section',
        bookId: bookId as string,
        bookTitle: bookTitle as string,
        headerColor: headerColor as string || bookDetails?.book?.header_color || 'green',
        backgroundEndColor: backgroundEndColor as string || bookDetails?.book?.background_end_color || 'green',
        buttonTextBorderColor: buttonTextBorderColor as string || bookDetails?.book?.button_text_border_color || 'green',
        buttonCircleColor: buttonCircleColor as string || bookDetails?.book?.button_circle_color || 'green'
      }
    });
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
      />  
      
      {/* Growing view that expands in bounce space */}
      <View style={[styles.growingArea, { backgroundColor: headerColor as string || bookDetails?.book?.header_color || 'green' }]} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
            <DisplayToggle />

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
                  headerColor={headerColor as string || bookDetails.book.header_color}
                  backgroundEndColor={backgroundEndColor as string || bookDetails.book.background_end_color}
                  buttonTextBorderColor={buttonTextBorderColor as string || bookDetails.book.button_text_border_color}
                  buttonCircleColor={buttonCircleColor as string || bookDetails.book.button_circle_color}
                />
              ) : (
                <ListDisplay
                  sections={bookDetails.sections}
                  onCardPress={handleCardPress}
                  bookId={bookId as string}
                  bookTitle={bookTitle as string}
                  headerColor={headerColor as string || bookDetails.book.header_color}
                  backgroundEndColor={backgroundEndColor as string || bookDetails.book.background_end_color}
                  buttonTextBorderColor={buttonTextBorderColor as string || bookDetails.book.button_text_border_color}
                  buttonCircleColor={buttonCircleColor as string || bookDetails.book.button_circle_color}
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
    // backgroundColor will be set dynamically to match header color
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
