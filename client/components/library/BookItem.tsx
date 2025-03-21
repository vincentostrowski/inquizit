import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { Book } from '../../data/books';

type Props = {
  book: Book;
}

// Calculate item width based on screen width and 3 columns
const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const PADDING = 8;
const itemWidth = (width - (PADDING * 2 * COLUMN_COUNT)) / COLUMN_COUNT;

export function BookItem({ book }: Props) {
  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: book.coverUrl }}
        style={styles.cover}
        resizeMode="cover"
      />
      <Text style={styles.title} numberOfLines={2}>
        {book.title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: itemWidth,
    padding: PADDING,
    alignItems: 'center',
  },
  cover: {
    width: itemWidth - (PADDING * 2),
    height: (itemWidth - (PADDING * 2)) * 1.5, // 3:2 aspect ratio
    borderRadius: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});
