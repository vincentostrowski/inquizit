import { View, Text, StyleSheet } from 'react-native';
import Card from '../common/Card';

interface Card {
  id: string;
  title: string;
  description: string;
  banner?: string;
}

interface OverlappingCardsProps {
  cards: Card[];
  size?: 'small' | 'medium' | 'large';
}

export default function OverlappingCards({ 
  cards, 
  size = 'small' 
}: OverlappingCardsProps) {
  const overlappingCards = cards.filter(card => card.banner).slice(0, 3);

  const renderCard = (card: Card | undefined, index: number, zIndex: number) => (
    <View
      key={card?.id || `empty-${index}`}
      style={[
        styles.cardContainer,
        { left: 16 + (index * 16), zIndex }
      ]}
    >
      {card ? (
        <Card
          title={card.title}
          description={card.description}
          banner={card.banner}
          size={size}
        />
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyCardText}>No Card</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.overlapContainer}>
        {renderCard(overlappingCards[0], 0, 20)}
        {renderCard(overlappingCards[1], 1, 10)}
        {renderCard(overlappingCards[2], 2, 0)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 208,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlapContainer: {
    position: 'relative',
    height: '100%',
    width: 200, // Fixed width to accommodate 3 overlapping cards
  },
  cardContainer: {
    position: 'absolute',
    top: 0,
  },
  emptyCard: {
    width: 138, // Small card width
    height: 184, // Small card height
    backgroundColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCardText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
