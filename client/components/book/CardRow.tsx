import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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
}

export default function CardRow({ title, cards, onCardPress, onSectionPress }: CardRowProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onSectionPress} style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
      </TouchableOpacity>
      
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
            onPress={() => onCardPress?.(card)}
            size="small"
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
    paddingHorizontal: 20,
    marginBottom: 6,
  },
  title: {
    fontSize: 14,
    color: '#1D1D1F',
    lineHeight: 20,
  },
  scrollContent: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingBottom: 36,
    gap: 16,
  },
});
