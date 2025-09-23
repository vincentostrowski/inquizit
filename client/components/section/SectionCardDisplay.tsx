import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { includesId } from '../../utils/idUtils';
import Card from '../common/Card';

interface CardData {
  id: string;
  title: string;
  description: string;
  banner?: string;
}

interface SectionCardDisplayProps {
  cards: CardData[];
  onCardPress?: (card: CardData) => void;
  isEditMode?: boolean;
  selectedCardIds?: string[];
  onCardSelection?: (cardId: string) => void;
}

export default function SectionCardDisplay({ 
  cards, 
  onCardPress, 
  isEditMode = false, 
  selectedCardIds = [], 
  onCardSelection 
}: SectionCardDisplayProps) {
  if (!cards || cards.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No cards available</Text>
      </View>
    );
  }

  console.log('Selected card IDs:', selectedCardIds);
  console.log('Cards:', cards);

  return (
    <ScrollView 
      style={styles.container} 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.cardsContainer}
    >
      {cards.map((card) => (
        <Card
          key={card.id}
          title={card.title}
          description={card.description}
          banner={card.banner}
          onPress={() => {
            if (isEditMode && onCardSelection) {
              onCardSelection(card.id);
            } else {
              onCardPress?.(card);
            }
          }}
          size="large"
          isSelected={includesId(selectedCardIds, card.id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingBottom: 20,
  },
  cardsContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    gap: 16, // Consistent spacing between all cards
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
