import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useBookDetails } from '../../../hooks/useBookDetails';
import ContentHeader from '../../../components/common/ContentHeader';
import GradientBackground from '../../../components/common/GradientBackground';
import Card from '../../../components/common/Card';
import Content from '../../../components/card/Content';
import SkeletonCardDisplay from '../../../components/card/SkeletonCardDisplay';
import SkeletonContent from '../../../components/card/SkeletonContent';

export default function CardScreen() {
  const { 
    cardId, 
    cardTitle, 
    bookId, 
    headerColor, 
    backgroundEndColor,
    buttonTextBorderColor, 
    buttonCircleColor 
  } = useLocalSearchParams();
  
  const { bookDetails, loading, error } = useBookDetails(bookId);
  // Find the specific card data
  const cardData = (() => {
    if (!bookDetails || !(bookDetails as any).sections) return null;
    
    // Search through all sections for the card
    for (const section of (bookDetails as any).sections) {
      const card = section.cards?.find((card: any) => 
        card.id === cardId || 
        card.id === String(cardId) || 
        String(card.id) === cardId
      );
      if (card) {
        return {
          id: card.id,
          title: card.title || (cardTitle as string) || 'Unknown Card',
          description: card.description || '',
          content: card.content || '',
          banner: card.banner,
          prompt: card.prompt || '',
          card_idea: card.card_idea || '',
          order: card.order || 0,
          createdAt: card.created_at || 'Unknown'
        };
      }
    }
    
    return null;
  })();

  const handleBack = () => {
    router.back();
  };

  const handleStartQuizit = () => {
    router.push({
      pathname: '/quizit',
      params: { 
        quizitId: cardId,
        quizitType: 'card'
      }
    });
  };

  const handleCheckConflicts = () => {
    // TODO: Implement check conflicts functionality
    console.log('Check conflicts for card:', cardId);
  };

  const handleViewPastQuizits = () => {
    // TODO: Navigate to past quizits screen
    console.log('View past quizits for card:', cardId);
  };

  return (
    <View style={styles.container}>
      <ContentHeader
        onBack={handleBack}
        onStartQuizit={handleStartQuizit}
        onCheckConflicts={handleCheckConflicts}
        onViewPastQuizits={handleViewPastQuizits}
        headerColor={headerColor as string || (bookDetails && (bookDetails as any).book ? (bookDetails as any).book.header_color : undefined) || '#1D1D1F'}
        buttonTextBorderColor={buttonTextBorderColor as string || (bookDetails && (bookDetails as any).book ? (bookDetails as any).book.button_text_border_color : undefined) || '#FFFFFF'}
        buttonCircleColor={buttonCircleColor as string || (bookDetails && (bookDetails as any).book ? (bookDetails as any).book.button_circle_color : undefined) || '#FFFFFF'}
      />
      
      <View style={[styles.growingArea, { backgroundColor: headerColor as string || (bookDetails && (bookDetails as any).book ? (bookDetails as any).book.header_color : undefined) || '#1D1D1F' }]} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card Display - Skeleton or Real */}
        {loading ? (
          <SkeletonCardDisplay
            headerColor={headerColor as string || (bookDetails && (bookDetails as any).book ? (bookDetails as any).book.header_color : undefined) || '#1D1D1F'}
            backgroundEndColor={backgroundEndColor as string || (bookDetails && (bookDetails as any).book ? (bookDetails as any).book.background_end_color : undefined) || '#1E40AF'}
          />
        ) : error ? (
          <View style={styles.cardDisplayContainer}>
            <GradientBackground
              headerColor={headerColor as string || (bookDetails && (bookDetails as any).book ? (bookDetails as any).book.header_color : undefined) || '#1D1D1F'}
              backgroundEndColor={backgroundEndColor as string || (bookDetails && (bookDetails as any).book ? (bookDetails as any).book.background_end_color : undefined) || '#1E40AF'}
              height={208}
              borderRadius={50} // 15% of 208px ≈ 30px
            />
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {error}</Text>
            </View>
          </View>
        ) : !cardData ? (
          <View style={styles.cardDisplayContainer}>
            <GradientBackground
              headerColor={headerColor as string || (bookDetails && (bookDetails as any).book ? (bookDetails as any).book.header_color : undefined) || '#1D1D1F'}
              backgroundEndColor={backgroundEndColor as string || (bookDetails && (bookDetails as any).book ? (bookDetails as any).book.background_end_color : undefined) || '#1E40AF'}
              height={208}
              borderRadius={50} // 15% of 208px ≈ 30px
            />
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Card not found</Text>
            </View>
          </View>
        ) : (
          <View style={styles.cardDisplayContainer}>
            <GradientBackground
              headerColor={headerColor as string || (bookDetails && (bookDetails as any).book ? (bookDetails as any).book.header_color : undefined) || '#1D1D1F'}
              backgroundEndColor={backgroundEndColor as string || (bookDetails && (bookDetails as any).book ? (bookDetails as any).book.background_end_color : undefined) || '#1E40AF'}
              height={208}
              borderRadius={50} // 15% of 208px ≈ 30px
            />
            <View style={styles.cardSection}>
              <Card
                title={cardData.title}
                description={cardData.description}
                banner={cardData.banner}
                size="large"
              />
            </View>
          </View>
        )}
        
        {/* Content - Skeleton or Real */}
        {loading ? (
          <SkeletonContent />
        ) : cardData ? (
          <Content
            cardData={cardData}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  cardDisplayContainer: {
    position: 'relative',
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: 'white',
  },
  cardSection: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
    zIndex: 1,
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
