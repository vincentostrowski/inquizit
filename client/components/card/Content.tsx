import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface ContentProps {
  cardData: {
    id: string;
    title: string;
    description: string;
    content: string;
    banner?: string;
    prompt: string;
    card_idea: string;
    order: number;
    createdAt: string;
  };
}

export default function Content({ 
  cardData
}: ContentProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.contentContainer}>
        <Text style={styles.contentText}>{cardData.content}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 14,
  },
  contentContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  contentText: {
    fontSize: 14,
    color: '#1D1D1F',
    lineHeight: 24,
  },
});
