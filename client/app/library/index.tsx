import { View, StyleSheet, ActivityIndicator } from "react-native";
import { BookGrid } from "../../components/library/BookGrid";
import { books as getAllBooks } from "../../data/books";
import { useState, useEffect } from "react";
import type { Book } from "../../data/types";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LibraryScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate network delay for now
    const loadBooks = async () => {
      try {
        setIsLoading(true);
        // In real implementation, this would be an API call
        const fetchedBooks = getAllBooks;
        setBooks(fetchedBooks);
      } catch (error) {
        console.error('Error loading books:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        <BookGrid books={books} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
