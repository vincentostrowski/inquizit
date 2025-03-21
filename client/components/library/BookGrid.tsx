import { FlatList } from 'react-native';
import { BookItem } from './BookItem';
import { books } from '../../data/books';

export function BookGrid() {
  return (
    <FlatList
      data={books}
      numColumns={3}
      renderItem={({ item }) => <BookItem book={item} />}
      keyExtractor={item => item.id}
    />
  );
}
