import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
        <View style={styles.titleRow}>
          <Ionicons name="trophy" size={20} color="#F59E0B" />
          <Text style={styles.title}>Expert In</Text>
        </View>
        <Text style={styles.count}>{expertBooks.length}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#8E8E93" />
        </View>
      ) : (
        <View style={styles.booksGrid}>
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
              <View style={styles.expertBadge}>
                <Ionicons name="checkmark" size={10} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  count: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  loadingContainer: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bookItem: {
    position: 'relative',
  },
  bookCover: {
    width: 60,
    height: 90,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  expertBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

