import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { expertiseService } from '../../services/expertiseService';

interface ExpertBook {
  book_id: number;
  expertise_achieved_at: string;
  books: {
    id: number;
    title: string;
    cover: string;
  };
}

interface ExpertSectionProps {
  userId: string;
  onBookPress?: (bookId: number) => void;
}

export default function ExpertSection({ userId, onBookPress }: ExpertSectionProps) {
  const [expertBooks, setExpertBooks] = useState<ExpertBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpertise();
  }, [userId]);

  const loadExpertise = async () => {
    if (!userId) return;
    
    setLoading(true);
    const { data, error } = await expertiseService.getPublicExpertise(userId);
    
    if (error) {
      console.error('Error loading expertise:', error);
    } else {
      setExpertBooks(data || []);
    }
    setLoading(false);
  };

  // Don't render section if no expert books and not loading
  if (!loading && expertBooks.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expert</Text>
        <View style={styles.headerLine} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#8E8E93" />
        </View>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.booksRow}
        >
          {expertBooks.map((item) => (
            <TouchableOpacity
              key={item.book_id}
              style={styles.bookItem}
              onPress={() => onBookPress?.(item.book_id)}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: item.books.cover }}
                style={styles.bookCover}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
    marginRight: 12,
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  loadingContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  booksRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bookItem: {
    // No extra styling needed
  },
  bookCover: {
    width: 56,
    height: 84,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
  },
});
