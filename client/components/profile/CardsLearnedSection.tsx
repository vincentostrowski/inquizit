import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { cardsLearnedService, MOCK_CARDS_LEARNED_DATA } from '../../services/cardsLearnedService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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

  // Don't render if loading
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Studied Content</Text>
          <View style={styles.headerLine} />
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

  // Build rows: Total first, then categories - 2 columns
  const allItems = [
    { name: 'Total', count: data.totalUniqueCards, isTotal: true },
    ...topCategories.map(c => ({ name: c.categoryName, count: c.count, isTotal: false }))
  ];

  // Split into left and right columns
  const leftColumn = allItems.filter((_, i) => i % 2 === 0);
  const rightColumn = allItems.filter((_, i) => i % 2 === 1);

  return (
    <>
      <TouchableOpacity 
        style={styles.container} 
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Studied Content</Text>
          <View style={styles.headerLine} />
        </View>

        <View style={styles.columnsContainer}>
          {/* Left Column */}
          <View style={styles.column}>
            {leftColumn.map((item, index) => (
              <View key={`left-${index}`} style={styles.row}>
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={[styles.categoryCount, item.isTotal && styles.totalCount]}>
                  {item.count}
                </Text>
              </View>
            ))}
          </View>

          {/* Right Column */}
          <View style={styles.column}>
            {rightColumn.map((item, index) => (
              <View key={`right-${index}`} style={styles.row}>
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.categoryCount}>{item.count}</Text>
              </View>
            ))}
          </View>
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
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      // Backdrop fades in first
      backdropOpacity.value = withTiming(0.5, { duration: 200 });
      // Then sheet slides up
      translateY.value = withDelay(100, withTiming(0, { duration: 300 }));
    } else {
      // Both animations happen simultaneously on close
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
      backdropOpacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(handleClose)();
      });
    }
  }, [visible]);

  const animatedSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const animatedBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
    };
  });

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={modalStyles.container}>
        <Animated.View style={[modalStyles.backdrop, animatedBackdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        <Animated.View style={[modalStyles.sheet, { paddingBottom: insets.bottom + 34 }, animatedSheetStyle]}>
          <View style={modalStyles.handleBar} />
          
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Studied Content</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {/* Total Summary */}
          <View style={modalStyles.totalSection}>
            <Text style={modalStyles.totalCount}>{data.totalUniqueCards}</Text>
            <Text style={modalStyles.totalLabel}>Total Cards Studied</Text>
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
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  columnsContainer: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
    paddingRight: 16,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  categoryCount: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  totalCount: {
    fontWeight: '600',
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    color: '#1D1D1F',
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
    color: '#1D1D1F',
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
