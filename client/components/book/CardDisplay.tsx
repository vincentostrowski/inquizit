import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import CardRow from './CardRow';

interface Card {
  id: string;
  title: string;
  description: string;
  banner?: string;
}

interface Section {
  id: string;
  title: string;
  cards: Card[];
}

interface CardDisplayProps {
  sections: Section[];
  onCardPress?: (card: Card) => void;
  bookId?: string;
  bookTitle?: string;
  headerColor?: string;
  backgroundEndColor?: string;
  buttonTextBorderColor?: string;
  buttonCircleColor?: string;
}

export default function CardDisplay({ 
  sections, 
  onCardPress, 
  bookId, 
  bookTitle, 
  headerColor, 
  backgroundEndColor,
  buttonTextBorderColor, 
  buttonCircleColor 
}: CardDisplayProps) {
  const handleSectionPress = (section: Section) => {
    router.push({
      pathname: '/library/section',
      params: {
        sectionId: section.id,
        sectionTitle: section.title,
        bookId: bookId || '',
        bookTitle: bookTitle || '',
        headerColor: headerColor || '#1D1D1F',
        backgroundEndColor: backgroundEndColor || '#1E40AF',
        buttonTextBorderColor: buttonTextBorderColor || '#FFFFFF',
        buttonCircleColor: buttonCircleColor || '#FFFFFF'
      }
    });
  };

  return (
    <View style={styles.container}>
      {sections.map((section) => (
        <CardRow
          key={section.id}
          title={section.title}
          cards={section.cards.map(card => ({
            id: card.id,
            title: card.title,
            description: card.description,
            banner: card.banner
          }))}
          onCardPress={onCardPress}
          onSectionPress={() => handleSectionPress(section)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 8,
  },
});
