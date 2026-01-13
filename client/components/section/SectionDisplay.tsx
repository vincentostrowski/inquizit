import { View, Text, StyleSheet } from 'react-native';
import OverlappingCards from './OverlappingCards';
import GradientBackground from '../common/GradientBackground';

interface Card {
  id: string;
  title: string;
  description: string;
  banner?: string;
}

interface SectionDisplayProps {
  headerColor?: string;
  backgroundEndColor?: string;
  cards?: Card[];
}

export default function SectionDisplay({ 
  headerColor = '#FF3B30',
  backgroundEndColor = '#8B0000',
  cards = []
}: SectionDisplayProps) {
  return (
    <View style={styles.container}>
      <GradientBackground
        headerColor={headerColor}
        backgroundEndColor={backgroundEndColor}
        height={208}
        borderRadius={50} // 15% of 208px ≈ 30px
      />
      <View style={styles.sectionContent}>
        <OverlappingCards
          cards={cards}
          size="small"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: 'white',
  },
  sectionContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});
