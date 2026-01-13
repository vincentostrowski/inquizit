import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useBookDetails } from '../../../hooks/useBookDetails';
import { useQuizitConfig } from '../../../context/QuizitConfigContext';
import { useAuth } from '../../../context/AuthContext';
import { normalizeId, compareIds } from '../../../utils/idUtils';
import { savedItemsService } from '../../../services/savedItemsService';
import ContentHeader from '../../../components/common/ContentHeader';
import ContentOptionsModal from '../../../components/common/ContentOptionsModal';
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
    bookTitle,
    bookCover,
    headerColor, 
    backgroundEndColor,
    buttonTextBorderColor, 
    buttonCircleColor 
  } = useLocalSearchParams();
  
  const { bookDetails, loading, error, updateBookSavedStatus, updateCardSavedStatus } = useBookDetails(bookId);
  const { showQuizitConfig, pushToNavigationStack, popFromNavigationStack } = useQuizitConfig();
  const { user } = useAuth();

  // Manage navigation stack
  useEffect(() => {
    if (bookId) {
      pushToNavigationStack(bookId as string);
      
      return () => {
        popFromNavigationStack(bookId as string);
      };
    }
  }, [bookId, pushToNavigationStack, popFromNavigationStack]);

  // Find the specific card data
  const cardData = (() => {
    if (!bookDetails || !(bookDetails as any).sections) return null;
    
    // Search through all sections for the card
    for (const section of (bookDetails as any).sections) {
      const card = section.cards?.find((card: any) => 
        compareIds(card.id, cardId)
      );
      if (card) {
        return {
          id: normalizeId(card.id),
          title: card.title || (cardTitle as string) || 'Unknown Card',
          description: card.description || '',
          content: card.content || '',
          banner: card.banner,
          prompt: card.prompt || '',
          card_idea: card.card_idea || '',
          order: card.order || 0,
          createdAt: card.created_at || 'Unknown',
          isSaved: card.isSaved || false
        };
      }
    }
    
    return null;
  })();

  const handleBack = () => {
    router.back();
  };

  const handleStartQuizit = () => {
    console.log('Start quizit for card:', cardId);
    console.log('Book title:', bookTitle);
    console.log('Book ID:', bookId);
    showQuizitConfig({
      title: bookTitle as string,
      isEditMode: false,
      bookSelections: [{
        bookId: bookId as string,
        bookTitle: bookTitle as string,
        bookCover: bookCover as string,
        selectedCardIds: [cardId as string],
        headerColor: headerColor as string || (bookDetails && (bookDetails as any).book ? (bookDetails as any).book.header_color : undefined) || 'green',
        backgroundEndColor: backgroundEndColor as string || (bookDetails && (bookDetails as any).book ? (bookDetails as any).book.background_end_color : undefined) || 'green',
        buttonTextBorderColor: buttonTextBorderColor as string || (bookDetails && (bookDetails as any).book ? (bookDetails as any).book.button_text_border_color : undefined) || 'green',
        buttonCircleColor: buttonCircleColor as string || (bookDetails && (bookDetails as any).book ? (bookDetails as any).book.button_circle_color : undefined) || 'green'
      }],
      isPairedMode: false,
      biasText: undefined
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

  // Save/Unsave handlers
  const handleEllipsisPress = () => {
    setShowContentOptionsModal(true);
  };

  const handleSaveCard = async () => {
    if (!user?.id || !cardId || !bookId) return;

    try {
      // Service will automatically save book if not already saved (cascade save)
      const { error } = await savedItemsService.saveCard(user.id, Number(cardId), Number(bookId));
      if (error) {
        Alert.alert('Error', 'Failed to save card. Please try again.');
        return;
      }
      // Update local state directly - save card
      updateCardSavedStatus(Number(cardId), true);
      // Also update book saved status (cascade save)
      if (!bookDetails?.book?.isSaved) {
        updateBookSavedStatus(true);
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred.');
      console.error('Error saving card:', err);
    }
  };

  const handleUnsaveCard = async () => {
    if (!user?.id || !cardId) return;

    try {
      const { error } = await savedItemsService.unsaveCard(user.id, Number(cardId));
      if (error) {
        Alert.alert('Error', 'Failed to unsave card. Please try again.');
        return;
      }
      // Update local state directly
      updateCardSavedStatus(Number(cardId), false);
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred.');
      console.error('Error unsaving card:', err);
    }
  };

  const handleContentOptionsSave = () => {
    if (cardData?.isSaved) {
      handleUnsaveCard();
    } else {
      handleSaveCard();
    }
  };

  const handleContentOptionsUnsave = () => {
    handleUnsaveCard();
  };

  // Get modal data for edit mode
  const { modalData } = useQuizitConfig();
  const isEditMode = modalData?.isEditMode || false;

  // Modal state
  const [showContentOptionsModal, setShowContentOptionsModal] = useState(false);

  return (
    <View style={styles.container}>
      <ContentHeader
        onBack={handleBack}
        onStartQuizit={handleStartQuizit}
        onCheckConflicts={handleCheckConflicts}
        onViewPastQuizits={handleViewPastQuizits}
        onEllipsisPress={handleEllipsisPress}
        headerColor={headerColor as string || (bookDetails && (bookDetails as any).book ? (bookDetails as any).book.header_color : undefined) || '#1D1D1F'}
        buttonTextBorderColor={buttonTextBorderColor as string || (bookDetails && (bookDetails as any).book ? (bookDetails as any).book.button_text_border_color : undefined) || '#FFFFFF'}
        buttonCircleColor={buttonCircleColor as string || (bookDetails && (bookDetails as any).book ? (bookDetails as any).book.button_circle_color : undefined) || '#FFFFFF'}
      />

      {/* Content Options Modal */}
      <ContentOptionsModal
        visible={showContentOptionsModal}
        contentType="card"
        isSaved={cardData?.isSaved || false}
        onClose={() => setShowContentOptionsModal(false)}
        onSave={handleContentOptionsSave}
        onUnsave={handleContentOptionsUnsave}
      />
      
      <View style={[styles.growingArea, { backgroundColor: headerColor as string || (bookDetails && (bookDetails as any).book ? (bookDetails as any).book.header_color : undefined) || '#1D1D1F' }]} />
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={[
          isEditMode && { paddingBottom: 150 }
        ]}
        showsVerticalScrollIndicator={false}
      >
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
