import { View, Image, Text, StyleSheet } from 'react-native';

interface Card {
  id: string;
  banner?: string;
}

interface OverlappingCardsProps {
  bookCover?: string;
  cards: Card[];
  size?: 'default' | 'small' | 'large';
}

export default function OverlappingCards({ 
  bookCover, 
  cards, 
  size = 'default' 
}: OverlappingCardsProps) {
  const sizeStyles = {
    default: { width: 152, height: 208 },
    small: { width: 128, height: 176 },
    large: { width: 176, height: 240 }
  };

  const currentSize = sizeStyles[size];
  const overlappingCards = cards;

  const renderCard = (card: Card | undefined, index: number, zIndex: number) => (
    <View
      key={card?.id || `empty-${index}`}
      style={[
        styles.cardContainer,
        currentSize,
        { left: 16 + (index * 16), zIndex }
      ]}
    >
      {card?.banner ? (
        <Image source={{ uri: card.banner }} style={styles.cardImage} resizeMode="cover" />
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyCardText}>No Card</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.overlapContainer, { width: currentSize.width + 48 }]}>
        {renderCard(overlappingCards[0], 0, 20)}
        {renderCard(overlappingCards[1], 1, 10)}
        {renderCard(overlappingCards[2], 2, 0)}

        {bookCover ? (
          <Image
            source={{ uri: bookCover }}
            style={[styles.bookCover, currentSize]}
            resizeMode="stretch"
          />
        ) : (
          <View style={[styles.defaultBookCover, currentSize]}>
            <Text style={styles.bookIcon}>📚</Text>
          </View>
        )}
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
  },
  bookCover: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 30,
    opacity: 1, // Restored opacity
  },
  defaultBookCover: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 30,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 1, // Restored opacity
  },
  bookIcon: {
    fontSize: 48,
  },
  cardContainer: {
    position: 'absolute',
    top: 0,
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    opacity: 1, // Restored opacity
  },
  cardImage: {
    width: '100%',
    height: 52,
    borderRadius: 8,
  },
  emptyCard: {
    width: '100%',
    height: 52,
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
