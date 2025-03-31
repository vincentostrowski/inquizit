import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../config/supabase";
import { BookGrid } from "../../components/library/BookGrid";
import type { Book } from "../../data/types";

export default function LibraryScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setIsLoading(true);
        let {data: Books, error} = await supabase.from('Book').select('*');
        setBooks(Books);
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
    <SafeAreaView style={{flex: 1, }} edges={['top']}>
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
