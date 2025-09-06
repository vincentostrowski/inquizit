import { View, Text, StyleSheet, ScrollView } from 'react-native';
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
}

export default function SectionCardDisplay({ cards, onCardPress }: SectionCardDisplayProps) {
  if (!cards || cards.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No cards available</Text>
      </View>
    );
  }

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
          onPress={() => onCardPress?.(card)}
          size="medium"
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
