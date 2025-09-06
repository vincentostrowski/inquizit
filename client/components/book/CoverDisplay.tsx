import { View, Text, StyleSheet, Image } from 'react-native';
import OverlappingCards from './OverlappingCards';
import GradientBackground from '../common/GradientBackground';

interface Card {
  id: string;
  banner?: string;
}

interface CoverDisplayProps {
  cover?: string;
  headerColor?: string;
  backgroundEndColor?: string;
  cards?: Card[];
}

export default function CoverDisplay({ 
  cover, 
  headerColor = '#FF3B30',
  backgroundEndColor = '#8B0000',
  cards = []
}: CoverDisplayProps) {
  return (
    <View style={styles.container}>
      <GradientBackground
        headerColor={headerColor}
        backgroundEndColor={backgroundEndColor}
        height={208}
        borderRadius={50} // 15% of 208px ≈ 30px
      />
      <View style={styles.coverSection}>
        <OverlappingCards
          bookCover={cover}
          cards={cards}
          size="default"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: 'white',
  },
  coverSection: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
    zIndex: 1,
  },
});
