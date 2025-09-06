import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Book } from '../../types/books';

interface BookRowItemProps {
  book: Book;
  onPress?: (book: Book) => void;
}

export default function BookRowItem({ book, onPress }: BookRowItemProps) {
  const handlePress = () => {
    if (onPress) {
      onPress(book);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.bookCover,
        !book.cover ? styles.defaultCover : {}
      ]}>
        {book.cover ? (
          <Image 
            source={{ uri: book.cover }} 
            style={styles.bookImage}
            resizeMode="stretch"
          />
        ) : (
          <Text style={styles.bookIcon}>📚</Text>
        )}
      </View>
      <Text style={styles.bookTitle} numberOfLines={2}>
        {book.title || 'Untitled Book'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    marginRight: 12,
  },
  bookCover: {
    width: 100,
    height: 140,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  defaultCover: {
    backgroundColor: '#F2F2F7',
  },
  bookIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  bookImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  bookTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1D1D1F',
    textAlign: 'center',
    lineHeight: 14,
    marginTop: 4,
    width: 100,
  },
});
