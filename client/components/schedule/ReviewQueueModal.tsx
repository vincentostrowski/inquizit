import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, ActivityIndicator, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useReviewQueue } from '../../hooks/useReviewQueue';
import { useAuth } from '../../context/AuthContext';
import { getDateKey } from '../../utils/dateUtils';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.5; // 50% of screen height

type ViewMode = 'calendar' | 'list';

interface ReviewQueueModalProps {
  visible: boolean;
  onClose: () => void;
  onRefresh?: () => void; // Optional callback to refresh parent screen
}

interface CardGroupedByDate {
  date: string; // YYYY-MM-DD format
  dateDisplay: string; // M / D / YYYY format
  cards: any[];
  count: number;
}

export default function ReviewQueueModal({ visible, onClose, onRefresh }: ReviewQueueModalProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { cards, loading, error, refreshReviewQueue } = useReviewQueue(user?.id);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      translateY.value = withTiming(0, { duration: 300 });
      backdropOpacity.value = withTiming(0.5, { duration: 300 });
      // Refresh queue data when modal opens to ensure it's up-to-date
      refreshReviewQueue();
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
      backdropOpacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(setIsVisible)(false);
      });
    }
  }, [visible, refreshReviewQueue]);

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

  const handleGestureEvent = (event: any) => {
    const { translationY } = event.nativeEvent;
    
    if (translationY > 0) {
      translateY.value = translationY;
    }
  };

  const handleGestureEnd = (event: any) => {
    const { translationY, velocityY } = event.nativeEvent;
    
    if (translationY > 100 || velocityY > 500) {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
      backdropOpacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(setIsVisible)(false);
        runOnJS(onClose)();
      });
    } else {
      translateY.value = withTiming(0, { duration: 200 });
    }
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'calendar' ? 'list' : 'calendar');
  };

  // Group cards by date for List View
  // card.due is now a DATE type (YYYY-MM-DD string), so we can use it directly
  const cardsByDate = useMemo(() => {
    const grouped: { [key: string]: any[] } = {};
    
    cards.forEach((card: any) => {
      if (!card.due) return;
      
      // Get date key directly from the date string (already in YYYY-MM-DD format)
      const dateKey = getDateKey(card.due);
      if (!dateKey) return;
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(card);
    });

    // Convert to array and format for display
    const result: CardGroupedByDate[] = Object.keys(grouped)
      .sort() // Sort dates chronologically
      .map(dateKey => {
        // Parse dateKey (YYYY-MM-DD) and format for display using local date
        const [year, month, day] = dateKey.split('-').map(Number);
        const date = new Date(year, month - 1, day); // Local date
        
        return {
          date: dateKey,
          dateDisplay: `${month} / ${day} / ${year}`,
          cards: grouped[dateKey],
          count: grouped[dateKey].length,
        };
      });

    return result;
  }, [cards]);

  // Group cards by date for Calendar View (count per date)
  // card.due is now a DATE type (YYYY-MM-DD string), so we can use it directly
  // For today: includes all overdue cards (due <= today)
  // For future dates: only cards due on that specific date
  const calendarData = useMemo(() => {
    const dateCounts: { [key: string]: number } = {};
    
    // Get today's date key for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = getDateKey(today);
    
    cards.forEach((card: any) => {
      if (!card.due) return;
      
      // Get date key directly from the date string (already in YYYY-MM-DD format)
      const dateKey = getDateKey(card.due);
      if (!dateKey) return;
      
      // For today: include all cards due today or overdue (due <= today)
      if (todayKey && dateKey <= todayKey) {
        dateCounts[todayKey] = (dateCounts[todayKey] || 0) + 1;
      } else {
        // For future dates: only count cards due on that specific date
        dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
      }
    });

    return dateCounts;
  }, [cards]);

  if (!isVisible) return null;

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Bottom Sheet */}
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleGestureEnd}
      >
        <Animated.View
          style={[
            styles.bottomSheet,
            { height: MODAL_HEIGHT, paddingBottom: insets.bottom },
            animatedSheetStyle,
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Review Queue</Text>
            <View style={styles.headerRight}>
              <TouchableOpacity 
                onPress={toggleViewMode} 
                style={styles.viewToggleButton}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={viewMode === 'calendar' ? 'list' : 'calendar'} 
                  size={24} 
                  color="#1D1D1F" 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#1D1D1F" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content Container */}
          <View style={styles.contentContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#636366" />
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : cards.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No cards due for review</Text>
              </View>
            ) : viewMode === 'list' ? (
              <ListView cardsByDate={cardsByDate} />
            ) : (
              <CalendarView calendarData={calendarData} />
            )}
          </View>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

// List View Component
function ListView({ cardsByDate }: { cardsByDate: CardGroupedByDate[] }) {
  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
      nestedScrollEnabled={true}
    >
      {cardsByDate.map((dateGroup) => (
        <View key={dateGroup.date} style={styles.dateSection}>
          {/* Date Header */}
          <View style={styles.dateHeader}>
            <Text style={styles.dateText}>{dateGroup.dateDisplay}</Text>
          </View>

          {/* Cards List */}
          {dateGroup.cards.map((card: any) => {
            const cardId = card.cards?.id;
            if (!cardId) return null;

            const bookCover = card.cards?.books?.cover;
            const cardTitle = card.cards?.title || 'Untitled Card';

            return (
              <View key={card.id || `card-${cardId}`} style={styles.cardRow}>
                <View style={styles.checkboxContainer}>
                  <View style={styles.checkbox} />
                </View>
                {bookCover && (
                  <Image 
                    source={{ uri: bookCover }} 
                    style={styles.bookCover}
                    resizeMode="cover"
                  />
                )}
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {cardTitle}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

// Calendar View Component
function CalendarView({ calendarData }: { calendarData: { [key: string]: number } }) {
  // Helper: Get local date key from Date object
  const getLocalDateKeyFromDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Day headers (Sunday = 0)
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate calendar grid for next 60 days, organized by month with proper week layout
  // Uses LOCAL dates (user's timezone)
  const monthsData = useMemo(() => {
    const months: { 
      [key: string]: {
        monthName: string;
        weeks: Array<Array<{ date: Date; dateKey: string; count: number; dayOfMonth: number; isToday: boolean }>>;
      }
    } = {};
    
    // Get today in local timezone
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = getLocalDateKeyFromDate(today);
    
    // Generate next 60 days (using local dates)
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateKey = getLocalDateKeyFromDate(date);
      const monthKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      if (!months[monthKey]) {
        months[monthKey] = {
          monthName: monthKey,
          weeks: [],
        };
      }

      const dayOfMonth = date.getDate();
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      
      // Get the last week for this month
      let currentWeek = months[monthKey].weeks[months[monthKey].weeks.length - 1];
      
      // If no week exists, or if this is Sunday (start of new week), create a new week
      if (!currentWeek || dayOfWeek === 0) {
        currentWeek = [];
        months[monthKey].weeks.push(currentWeek);
        
        // If this is not Sunday, fill in the days from the start of the week (Sunday)
        if (dayOfWeek !== 0) {
          const firstDayOfWeek = new Date(date);
          firstDayOfWeek.setDate(date.getDate() - dayOfWeek);
          
          // Fill in all days from Sunday to the day before current date
          for (let j = 0; j < dayOfWeek; j++) {
            const fillDate = new Date(firstDayOfWeek);
            fillDate.setDate(firstDayOfWeek.getDate() + j);
            const fillDateKey = getLocalDateKeyFromDate(fillDate);
            const isToday = fillDateKey === todayKey;
            
            currentWeek.push({
              date: fillDate,
              dateKey: fillDateKey,
              count: calendarData[fillDateKey] || 0,
              dayOfMonth: fillDate.getDate(),
              isToday,
            });
          }
        }
      }
      
      const isToday = dateKey === todayKey;
      currentWeek.push({
        date,
        dateKey,
        count: calendarData[dateKey] || 0,
        dayOfMonth,
        isToday,
      });
    }

    // Fill in remaining days of the last week if needed (to complete the week)
    Object.keys(months).forEach(monthKey => {
      const month = months[monthKey];
      if (month.weeks.length > 0) {
        const lastWeek = month.weeks[month.weeks.length - 1];
        while (lastWeek.length < 7) {
          const lastDate = new Date(lastWeek[lastWeek.length - 1].date);
          lastDate.setDate(lastDate.getDate() + 1);
          const emptyDateKey = getLocalDateKeyFromDate(lastDate);
          const isToday = emptyDateKey === todayKey;
          
          lastWeek.push({
            date: lastDate,
            dateKey: emptyDateKey,
            count: calendarData[emptyDateKey] || 0,
            dayOfMonth: lastDate.getDate(),
            isToday,
          });
        }
      }
    });

    return months;
  }, [calendarData]);

  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
      nestedScrollEnabled={true}
    >
      {Object.keys(monthsData).map((monthKey) => {
        const month = monthsData[monthKey];
        return (
          <View key={monthKey} style={styles.monthSection}>
            <Text style={styles.monthHeader}>{month.monthName}</Text>
            
            {/* Day Headers */}
            <View style={styles.dayHeadersRow}>
              {dayHeaders.map((dayName) => (
                <View key={dayName} style={styles.dayHeaderCell}>
                  <Text style={styles.dayHeaderText}>{dayName}</Text>
                </View>
              ))}
            </View>
            
            {/* Calendar Weeks */}
            {month.weeks.map((week, weekIndex) => (
              <View key={`week-${weekIndex}`} style={styles.calendarWeek}>
                {week.map((day) => (
                  <View 
                    key={day.dateKey} 
                    style={[
                      styles.calendarCell,
                      day.count === 0 && styles.calendarCellEmpty,
                      day.isToday && styles.calendarCellToday
                    ]}
                  >
                    <Text style={[
                      styles.cellDayNumber,
                      day.isToday && styles.cellDayNumberToday
                    ]}>
                      {day.dayOfMonth}
                    </Text>
                    {day.count > 0 && (
                      <Text style={styles.cellCount}>{day.count}</Text>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewToggleButton: {
    padding: 4,
  },
  closeButton: {
    padding: 4,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    minHeight: 0,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  // List View Styles
  dateSection: {
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#8E8E93',
    backgroundColor: 'transparent',
  },
  bookCover: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: '#F2F2F7',
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    color: '#1D1D1F',
    fontWeight: '500',
  },
  // Calendar View Styles
  monthSection: {
    marginBottom: 24,
  },
  monthHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  dayHeadersRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    maxWidth: 50,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
  },
  calendarWeek: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  calendarCell: {
    flex: 1,
    aspectRatio: 1,
    minWidth: 40,
    maxWidth: 50,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  calendarCellEmpty: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  calendarCellToday: {
    borderWidth: 2,
    borderColor: '#1D1D1F',
  },
  cellDayNumber: {
    position: 'absolute',
    top: 4,
    left: 4,
    fontSize: 9,
    fontWeight: '500',
    color: '#8E8E93',
  },
  cellDayNumberToday: {
    color: '#1D1D1F',
    fontWeight: '600',
  },
  cellCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D1D1F',
  },
});

