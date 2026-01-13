import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { includesId } from '../../utils/idUtils';
import Card from '../common/Card';

interface CardData {
  id: string;
  title: string;
  description: string;
  banner?: string;
}

interface CardRowProps {
  title: string;
  cards: CardData[];
  onCardPress?: (card: CardData) => void;
  onSectionPress?: () => void;
  isEditMode?: boolean;
  selectedCardIds?: string[];
  onCardSelection?: (cardId: string) => void;
  onSelectAll?: (cardIds: string[]) => void;
}

export default function CardRow({ 
  title, 
  cards, 
  onCardPress, 
  onSectionPress, 
  isEditMode = false, 
  selectedCardIds = [], 
  onCardSelection,
  onSelectAll
}: CardRowProps) {
  // Check if all cards in this row are selected
  const allCardsSelected = cards.length > 0 && cards.every(card => includesId(selectedCardIds, card.id));
  const someCardsSelected = cards.some(card => includesId(selectedCardIds, card.id));
  
  const handleSelectAll = () => {
    if (onSelectAll) {
      const cardIds = cards.map(card => card.id);
      onSelectAll(cardIds);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <TouchableOpacity onPress={onSectionPress} style={styles.titleButton}>
          <Text style={styles.title}>{title}</Text>
        </TouchableOpacity>
        
        {/* Select All Toggle - Only show in edit mode */}
        {isEditMode && (
          <TouchableOpacity onPress={handleSelectAll} style={styles.selectAllButton}>
            <Ionicons 
              name={allCardsSelected ? "checkmark" : "square-outline"} 
              size={14} 
              color={allCardsSelected ? "#000000" : "#8E8E93"} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
            size="small"
            isSelected={includesId(selectedCardIds, card.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 6,
  },
  titleButton: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: '#1D1D1F',
    lineHeight: 20,
  },
  selectAllButton: {
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 20,
    minHeight: 20,
  },
  scrollContent: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingBottom: 36,
    gap: 16,
  },
});
