import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { spacedRepetitionService } from '../../services/spacedRepetitionService';
import { getDateKey, formatDateString } from '../../utils/dateUtils';

interface ConsistencyGraphProps {
  userId: string;
}

interface ConsistencyData {
  date: string;
  count: number;
}

export default function ConsistencyGraph({ userId }: ConsistencyGraphProps) {
  const [data, setData] = useState<ConsistencyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  // Keep previous data during refresh to prevent flash
  const previousDataRef = React.useRef<ConsistencyData[]>([]);

  const loadConsistencyData = React.useCallback(async (isRefresh: boolean = false) => {
    if (!userId) return;

    if (!isRefresh) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);

    try {
      // Get data for the last 6 months (going back from current week)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Calculate end of current week (Saturday) for week generation
      const endOfWeek = new Date(today);
      const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
      const daysUntilSaturday = 6 - dayOfWeek;
      endOfWeek.setDate(today.getDate() + daysUntilSaturday);
      
      // Calculate start date: 6 months back from current week
      const startDate = new Date(endOfWeek);
      startDate.setMonth(startDate.getMonth() - 6);
      // Start from the beginning of that week (Sunday)
      const startDayOfWeek = startDate.getDay();
      startDate.setDate(startDate.getDate() - startDayOfWeek);

      // Fetch data up to today (not end of week) since we only show previous days
      const startDateStr = getDateKey(startDate) || formatDateString(startDate) || '';
      const endDateStr = getDateKey(today) || formatDateString(today) || '';

      const { data: consistencyData, error: dataError } = 
        await spacedRepetitionService.getConsistencyData(userId, startDateStr, endDateStr);

      if (dataError) {
        setError('Failed to load consistency data');
        // Don't clear data on error during refresh - keep showing stale data
        if (!isRefresh) {
          setData([]);
        }
        return;
      }

      // Always update with new data (even if empty array - that's valid)
      // This ensures we show the latest data, but only after it's fetched
      if (consistencyData !== null && consistencyData !== undefined) {
        // Preserve current data in ref before updating (for use during refresh transitions)
        if (data.length > 0) {
          previousDataRef.current = data;
        }
        setData(consistencyData);
        // Update ref with new data after state update
        previousDataRef.current = consistencyData;
      } else if (!isRefresh) {
        // Only set empty array on initial load if we got null/undefined
        setData([]);
        previousDataRef.current = [];
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error loading consistency data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    loadConsistencyData(false);
  }, [userId, loadConsistencyData]);

  // Refresh on focus - but only if we already have data loaded
  // Use a ref to track if we should refresh to avoid loops
  const hasInitialData = React.useRef(false);
  
  React.useEffect(() => {
    if (data.length > 0 && !loading) {
      hasInitialData.current = true;
    }
  }, [data.length, loading]);

  useFocusEffect(
    React.useCallback(() => {
      if (userId && hasInitialData.current) {
        // Only refresh if we already have data (stale-while-revalidate)
        loadConsistencyData(true);
      }
    }, [userId, loadConsistencyData])
  );

  // Create a map of date -> count for quick lookup
  // Use previous data during refresh to prevent flash
  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    const dataToUse = isRefreshing && data.length === 0 ? previousDataRef.current : data;
    dataToUse.forEach(item => {
      map.set(item.date, item.count);
    });
    return map;
  }, [data, isRefreshing]);

  // Generate weeks: from 6 months ago to current week
  // Each week is represented as an array of 7 days (Sunday to Saturday)
  // Only previous days (before today) are shown
  const weeks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = getDateKey(today) || '';
    
    // Calculate end of current week (Saturday)
    const endOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = 6 - dayOfWeek;
    endOfWeek.setDate(today.getDate() + daysUntilSaturday);
    
    // Calculate start date: 6 months back from current week
    const startDate = new Date(endOfWeek);
    startDate.setMonth(startDate.getMonth() - 6);
    // Start from the beginning of that week (Sunday)
    const startDayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDayOfWeek);
    
    const weeksArray: Array<Array<{ date: Date; dateKey: string; isPast: boolean }>> = [];
    const current = new Date(startDate);
    
    while (current <= endOfWeek) {
      const week: Array<{ date: Date; dateKey: string; isPast: boolean }> = [];
      
      // Generate 7 days for this week (Sunday to Saturday)
      for (let i = 0; i < 7; i++) {
        const weekDate = new Date(current);
        weekDate.setDate(current.getDate() + i);
        const dateKey = getDateKey(weekDate) || '';
        const isPast = dateKey < todayKey; // Only show previous days
        
        week.push({
          date: weekDate,
          dateKey,
          isPast,
        });
      }
      
      weeksArray.push(week);
      current.setDate(current.getDate() + 7); // Move to next week
    }
    
    return weeksArray;
  }, []);

  // Get color intensity based on review count
  const getColorIntensity = (count: number): string => {
    if (count === 0) return '#EBEDF0'; // Light grey (no activity)
    if (count >= 10) return '#9CA3AF'; // Medium-dark grey (high activity, not too dark)
    if (count >= 5) return '#D1D5DB'; // Medium grey
    if (count >= 3) return '#E5E7EB'; // Light-medium grey
    if (count >= 1) return '#F3F4F6'; // Very light grey
    return '#EBEDF0'; // Default (no activity)
  };

  // Generate month labels aligned with weeks
  // Each month label should start at the first week column that contains any day from that month
  const monthLabels = useMemo(() => {
    const monthFirstWeek = new Map<string, number>(); // month -> first week index where it appears
    
    // Find the first week index for each month
    weeks.forEach((week, weekIndex) => {
      // Check all days in the week to see which months are represented
      const monthsInWeek = new Set<string>();
      week.forEach(day => {
        const monthKey = day.date.toLocaleDateString('en-US', { month: 'short' });
        monthsInWeek.add(monthKey);
      });
      
      // For each month in this week, if we haven't recorded its first week yet, record it
      monthsInWeek.forEach(monthKey => {
        if (!monthFirstWeek.has(monthKey)) {
          monthFirstWeek.set(monthKey, weekIndex);
        }
      });
    });
    
    // Convert to array and sort by week index to maintain chronological order
    const labels = Array.from(monthFirstWeek.entries())
      .sort((a, b) => a[1] - b[1]) // Sort by week index
      .map(([month, weekIndex]) => ({
        month,
        weekIndex,
      }));
    
    return labels;
  }, [weeks]);

  // Calculate max count for normalization (optional, for future use)
  const maxCount = useMemo(() => {
    return Math.max(...data.map(d => d.count), 1);
  }, [data]);

  if (error && data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Calculate total width needed for all weeks to center the graph
  const totalWeeks = weeks.length;
  const weekColumnWidth = 13; // 10px square + 3px gap
  const totalGraphWidth = totalWeeks * weekColumnWidth;
  const graphStartX = containerWidth > 0 ? (containerWidth - totalGraphWidth) / 2 : 0;

  return (
    <View 
      style={styles.container}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width);
      }}
    >
      {/* Month Labels */}
      <View style={styles.monthLabelsContainer}>
        {monthLabels.map(({ month, weekIndex }) => {
          // Calculate position: labels should align with the centered grid
          const leftPosition = graphStartX + (weekIndex * weekColumnWidth);
          return (
            <View 
              key={`${month}-${weekIndex}`} 
              style={[styles.monthLabelContainer, { left: leftPosition }]}
            >
              <Text style={styles.monthLabel}>{month}</Text>
            </View>
          );
        })}
      </View>

      {/* Graph Grid - Weeks as columns */}
      <View style={styles.graphContainer}>
        <View style={[styles.grid, { width: totalGraphWidth }]}>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.weekColumn}>
              {week.map((day, dayIndex) => {
                // Only show previous days (not today or future)
                if (!day.isPast) {
                  return (
                    <View
                      key={`${day.dateKey}-${dayIndex}`}
                      style={[styles.square, styles.squareEmpty]}
                    />
                  );
                }
                
                // During initial loading, show empty squares to maintain layout
                const count = loading && data.length === 0 ? 0 : (dataMap.get(day.dateKey) || 0);
                const color = getColorIntensity(count);

                return (
                  <View
                    key={`${day.dateKey}-${dayIndex}`}
                    style={[
                      styles.square,
                      { backgroundColor: color },
                    ]}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  monthLabelsContainer: {
    height: 20,
    marginBottom: 8,
    width: '100%',
    position: 'relative',
  },
  monthLabelContainer: {
    position: 'absolute',
    top: 0,
  },
  monthLabel: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
  },
  refreshIndicator: {
    marginLeft: 8,
  },
  graphContainer: {
    width: '100%',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    gap: 3,
  },
  weekColumn: {
    flexDirection: 'column',
    gap: 3,
  },
  square: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  squareEmpty: {
    backgroundColor: 'transparent',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

