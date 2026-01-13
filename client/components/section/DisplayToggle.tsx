import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useViewMode } from '../../context/ViewModeContext';
import { includesId } from '../../utils/idUtils';

interface DisplayToggleProps {
  filterMode: 'all' | 'saved';
  setFilterMode: (mode: 'all' | 'saved') => void;
  isEditMode?: boolean;
  selectedCardIds?: string[];
  allCardIds?: string[];
  onSelectAll?: () => void;
}

export default function DisplayToggle({ 
  filterMode, 
  setFilterMode, 
  isEditMode = false, 
  selectedCardIds = [], 
  allCardIds = [], 
  onSelectAll 
}: DisplayToggleProps) {
  const { viewMode, setViewMode } = useViewMode();
  
  // Check if all cards are selected
  const allCardsSelected = allCardIds.length > 0 && allCardIds.every(cardId => includesId(selectedCardIds, cardId));
  
  return (
    <View style={styles.container}>
      {/* Left side: Filter and View toggles */}
      <View style={styles.leftSection}>
        {/* All/Saved Filter Toggle */}
        <View style={styles.filterToggle}>
          <TouchableOpacity 
            onPress={() => setFilterMode('all')} 
            style={[styles.filterButton, filterMode === 'all' && styles.activeFilterButton]}
          >
            <Text style={[styles.filterText, filterMode === 'all' && styles.activeFilterText]}>All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setFilterMode('saved')} 
            style={[styles.filterButton, filterMode === 'saved' && styles.activeFilterButton]}
          >
            <Text style={[styles.filterText, filterMode === 'saved' && styles.activeFilterText]}>Saved</Text>
          </TouchableOpacity>
        </View>
        
        {/* Vertical Line */}
        <View style={styles.verticalLine} />
        
        {/* View Mode Toggle */}
        <View style={styles.controls}>
        {/* Card View Button */}
        <TouchableOpacity 
          onPress={() => setViewMode('cards')} 
          style={[styles.button]}
        >
          <View style={styles.cardIconContainer}>
            <View style={[styles.iconBarThick, viewMode === 'cards' && styles.activeIconBar]} />
            <View style={[styles.iconBarThin, viewMode === 'cards' && styles.activeIconBar]} />
          </View>
        </TouchableOpacity>
        
        {/* List View Button */}
        <TouchableOpacity 
          onPress={() => setViewMode('list')} 
          style={[styles.button]}
        >
          <View style={styles.iconContainer}>
            <View style={[styles.iconLine, viewMode === 'list' && styles.activeIconLine]} />
            <View style={[styles.iconLine, viewMode === 'list' && styles.activeIconLine]} />
            <View style={[styles.iconLine, viewMode === 'list' && styles.activeIconLine]} />
          </View>
        </TouchableOpacity>
        </View>
      </View>
      
      {/* Select All Button - Only show in edit mode */}
      {isEditMode && onSelectAll && (
        <TouchableOpacity onPress={onSelectAll} style={styles.selectAllButton}>
          <Text style={[styles.selectAllText, allCardsSelected && styles.selectAllTextSelected]}>
            {allCardsSelected ? "Deselect All" : "Select All"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28,
  },
  activeFilterButton: {
    // No background color
  },
  filterText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '400',
  },
  activeFilterText: {
    color: '#1D1D1F',
    fontWeight: '500',
  },
  verticalLine: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    padding: 8,
    borderRadius: 6,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Card view icons (vertical bars side by side)
  cardIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  iconBarThick: {
    width: 10,
    height: 12,
    backgroundColor: '#8E8E93',
  },
  iconBarThin: {
    width: 2,
    height: 12,
    backgroundColor: '#8E8E93',
  },
  activeIconBar: {
    backgroundColor: '#1D1D1F',
  },
  // List view icons (horizontal lines)
  iconLine: {
    width: 12, // Match total width of card view (10 + 2 + 2)
    height: 2,
    backgroundColor: '#8E8E93',
    marginVertical: 1,
  },
  activeIconLine: {
    backgroundColor: '#1D1D1F',
  },
  selectAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28,
  },
  selectAllText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '400',
  },
  selectAllTextSelected: {
    color: '#8E8E93',
    fontWeight: '400',
  },
});
