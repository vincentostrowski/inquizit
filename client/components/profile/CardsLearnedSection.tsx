import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cardsLearnedService, MOCK_CARDS_LEARNED_DATA } from '../../services/cardsLearnedService';

// Set to true to use mock data for styling, false for real data
const USE_MOCK_DATA = false;

interface CategoryCount {
  categoryId: string;
  categoryName: string;
  count: number;
}

interface CardsLearnedData {
  totalUniqueCards: number;
  categories: CategoryCount[];
}

interface CardsLearnedSectionProps {
  userId: string;
}

export default function CardsLearnedSection({ userId }: CardsLearnedSectionProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [data, setData] = useState<CardsLearnedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    if (USE_MOCK_DATA) {
      // Use mock data for styling
      setData(MOCK_CARDS_LEARNED_DATA);
      setLoading(false);
      return;
    }

    if (!userId) return;

    setLoading(true);
    const { data: statsData, error } = await cardsLearnedService.getCardsLearnedStats(userId);
    
    if (error) {
      console.error('Error loading cards learned:', error);
    } else {
      setData(statsData);
    }
    setLoading(false);
  };

  const topCategories = data?.categories?.slice(0, 5) || [];

  // Don't render if loading or no cards learned
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="school" size={20} color="#3B82F6" />
            <Text style={styles.title}>Cards Learned</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#8E8E93" />
        </View>
      </View>
    );
  }

  if (!data || data.totalUniqueCards === 0) {
    return null;
  }

  return (
    <>
      <TouchableOpacity 
        style={styles.container} 
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="school" size={20} color="#3B82F6" />
            <Text style={styles.title}>Cards Learned</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </View>

        <View style={styles.grid}>
          {/* Total Cards - Top Left */}
          <View style={styles.gridItem}>
            <Text style={styles.totalCount}>{data.totalUniqueCards}</Text>
            <Text style={styles.totalLabel}>Total Cards</Text>
          </View>

          {/* Top 5 Categories */}
          {topCategories.map((category) => (
            <View key={category.categoryId} style={styles.gridItem}>
              <Text style={styles.categoryCount}>{category.count}</Text>
              <Text style={styles.categoryName} numberOfLines={1}>
                {category.categoryName}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>

      {/* Full Categories Modal */}
      <CardsLearnedModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        data={data}
      />
    </>
  );
}

interface CardsLearnedModalProps {
  visible: boolean;
  onClose: () => void;
  data: CardsLearnedData;
}

function CardsLearnedModal({ visible, onClose, data }: CardsLearnedModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.container}>
        <Pressable style={modalStyles.backdrop} onPress={onClose} />
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handleBar} />
          
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Cards Learned</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {/* Total Summary */}
          <View style={modalStyles.totalSection}>
            <Text style={modalStyles.totalCount}>{data.totalUniqueCards}</Text>
            <Text style={modalStyles.totalLabel}>Total Unique Cards</Text>
          </View>

          {/* Category Breakdown */}
          <Text style={modalStyles.sectionTitle}>By Category</Text>
          <ScrollView style={modalStyles.categoryList} showsVerticalScrollIndicator={false}>
            {data.categories.map((category, index) => (
              <View key={category.categoryId} style={modalStyles.categoryRow}>
                <View style={modalStyles.categoryInfo}>
                  <Text style={modalStyles.categoryRank}>{index + 1}</Text>
                  <Text style={modalStyles.categoryName}>{category.categoryName}</Text>
                </View>
                <Text style={modalStyles.categoryCount}>{category.count}</Text>
              </View>
            ))}
          </ScrollView>

          <Text style={modalStyles.footnote}>
            Note: Cards can appear in multiple categories if their book belongs to multiple categories.
          </Text>
        </View>
      </View>
    </Modal>
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
  loadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  totalCount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
  },
  categoryCount: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
  },
});

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    maxHeight: '80%',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  closeButton: {
    padding: 4,
  },
  totalSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  totalCount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#3B82F6',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryList: {
    paddingHorizontal: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryRank: {
    fontSize: 14,
    fontWeight: '500',
    color: '#C7C7CC',
    width: 24,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  categoryCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  footnote: {
    fontSize: 12,
    fontWeight: '400',
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    fontStyle: 'italic',
  },
});

