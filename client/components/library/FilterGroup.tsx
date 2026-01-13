import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FilterGroupProps {
  savedFilterActive?: boolean;
  onSavedFilterToggle?: (active: boolean) => void;
}

export default function FilterGroup({ savedFilterActive = false, onSavedFilterToggle }: FilterGroupProps) {
  const handleSavedFilterPress = () => {
    const newActive = !savedFilterActive;
    onSavedFilterToggle?.(newActive);
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterButton, savedFilterActive && styles.activeFilter]}
            onPress={handleSavedFilterPress}
          >
            <Ionicons name="bookmark" size={16} color={savedFilterActive ? "#1D1D1F" : "#8E8E93"} style={styles.filterIcon} />
            <Text style={[styles.filterText, savedFilterActive && styles.activeFilterText]}>Saved</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Relationships</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Business</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Self Help</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    minHeight: 40,
  },
  activeFilter: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5EA',
  },
  filterIcon: {
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#1D1D1F',
    fontWeight: '600',
  },
});
