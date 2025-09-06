import { View, Text, StyleSheet, ScrollView } from 'react-native';
import CardComponent from '../common/CardComponent';

interface Card {
  id: string;
  title: string;
  isBookmarked?: boolean;
}

interface SectionListDisplayProps {
  cards: Card[];
  onCardPress?: (card: Card) => void;
}

export default function SectionListDisplay({ cards, onCardPress }: SectionListDisplayProps) {
  if (!cards || cards.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No cards available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.cardsContainer}>
        {cards.map((card) => (
          <CardComponent
            key={card.id}
            title={card.title}
            isBookmarked={card.isBookmarked}
            onPress={() => onCardPress?.(card)}
            size="medium"
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
  },
  cardsContainer: {
    paddingHorizontal: 10,
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
