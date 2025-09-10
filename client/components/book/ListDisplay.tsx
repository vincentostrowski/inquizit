import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import SectionComponent from './SectionComponent';

interface Card {
  id: string;
  title: string;
  description: string;
  banner?: string;
  sectionTitle?: string;
}

interface Section {
  id: string;
  title: string;
  cards: Card[];
}

interface ListDisplayProps {
  sections: Section[];
  onCardPress?: (card: Card) => void;
  bookId?: string;
  bookTitle?: string;
  bookCover?: string;
  headerColor?: string;
  backgroundEndColor?: string;
  buttonTextBorderColor?: string;
  buttonCircleColor?: string;
  isEditMode?: boolean;
  selectedCardIds?: string[];
  onCardSelection?: (cardId: string) => void;
}

export default function ListDisplay({ 
  sections, 
  onCardPress, 
  bookId, 
  bookTitle, 
  bookCover,
  headerColor, 
  backgroundEndColor,
  buttonTextBorderColor, 
  buttonCircleColor,
  isEditMode = false,
  selectedCardIds = [],
  onCardSelection
}: ListDisplayProps) {

  const handleSectionPress = (section: Section) => {
    router.push({
      pathname: '/library/section',
      params: {
        sectionId: section.id,
        sectionTitle: section.title,
        bookId: bookId || '',
        bookTitle: bookTitle || '',
        bookCover: bookCover || '',
        headerColor: headerColor || '#1D1D1F',
        backgroundEndColor: backgroundEndColor || '#1E40AF',
        buttonTextBorderColor: buttonTextBorderColor || '#FFFFFF',
        buttonCircleColor: buttonCircleColor || '#FFFFFF'
      }
    });
  };

  // Transform real cards for display
  const transformCards = (section: Section) => {
    return section.cards.map((card, index) => ({
      id: card.id,
      title: card.title,
      isBookmarked: index > 0, // First card doesn't have bookmark, others do
    }));
  };

  if (!sections || sections.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No sections available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionsContainer}>
        {sections.map((section) => (
          <SectionComponent
            key={section.id}
            title={section.title}
            cards={transformCards(section)}
            onPress={() => handleSectionPress(section)}
            isEditMode={isEditMode}
            selectedCardIds={selectedCardIds}
            onCardSelection={onCardSelection}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 8,
  },
  sectionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
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
