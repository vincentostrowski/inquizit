import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { includesId } from '../../utils/idUtils';
import { useViewMode } from '../../context/ViewModeContext';
interface BookDisplayToggleProps {
  filterMode: 'all' | 'main' | 'saved';
  setFilterMode: (mode: 'all' | 'main' | 'saved') => void;
  isEditMode?: boolean;
  selectedCardIds?: string[];
  allCardIds?: string[];
  onSelectAll?: () => void;
  loading?: boolean;
  viewMode?: 'cards' | 'list';
  isAllSectionsExpanded?: boolean;
  onExpandAllSections?: () => void;
  onCollapseAllSections?: () => void;
}

export default function BookDisplayToggle({ 
  filterMode, 
  setFilterMode, 
  isEditMode = false, 
  selectedCardIds = [], 
  allCardIds = [], 
  onSelectAll,
  loading = false,
  viewMode: externalViewMode,
  isAllSectionsExpanded = false,
  onExpandAllSections,
  onCollapseAllSections
}: BookDisplayToggleProps) {
  const { viewMode: contextViewMode, setViewMode } = useViewMode();
  const viewMode = externalViewMode || contextViewMode;
  
  // Check if all cards are selected
  const allCardsSelected = allCardIds.length > 0 && allCardIds.every(cardId => includesId(selectedCardIds, cardId));
  
  return (
    <View style={styles.container}>
      {/* Left side: Filter and View toggles */}
      <View style={styles.leftSection}>
        {/* All/Main/Saved Filter Toggle */}
        <View style={styles.filterToggle}>
        <TouchableOpacity 
          onPress={() => setFilterMode('all')} 
          style={[styles.filterButton, filterMode === 'all' && styles.activeFilterButton]}
        >
          <Text style={[styles.filterText, filterMode === 'all' && styles.activeFilterText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setFilterMode('main')} 
          style={[styles.filterButton, filterMode === 'main' && styles.activeFilterButton]}
        >
          <Text style={[styles.filterText, filterMode === 'main' && styles.activeFilterText]}>Main</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setFilterMode('saved')} 
          style={[styles.filterButton, filterMode === 'saved' && styles.activeFilterButton]}
        >
          <Text style={[styles.filterText, filterMode === 'saved' && styles.activeFilterText]}>Saved</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.verticalLine} />
      
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
      
      {/* Right side buttons */}
      <View style={styles.rightSection}>
        {/* Select All Button - Only show in edit mode, when not loading, and when data is available */}
        {isEditMode && onSelectAll && !loading && allCardIds.length > 0 && (
          <TouchableOpacity onPress={onSelectAll} style={styles.selectAllButton}>
            <Text style={[styles.selectAllText, allCardsSelected && styles.selectAllTextSelected]}>
              {allCardsSelected ? "Deselect All" : "Select All"}
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Expand/Collapse All Button - Only show in list view mode and not in edit mode */}
        {viewMode === 'list' && !isEditMode && onExpandAllSections && onCollapseAllSections && (
          <TouchableOpacity 
            onPress={isAllSectionsExpanded ? onCollapseAllSections : onExpandAllSections} 
            style={styles.expandCollapseButton}
          >
            <Text style={styles.expandCollapseText}>
              {isAllSectionsExpanded ? "Collapse" : "Expand"}
            </Text>
            <Ionicons 
              name={isAllSectionsExpanded ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#8E8E93" 
            />
          </TouchableOpacity>
        )}
      </View>
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
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  verticalLine: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
  },
  // Filter toggle styles - no background, black selected
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
  // View mode toggle styles
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
  expandCollapseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 4,
    minHeight: 28,
  },
  expandCollapseText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '400',
  },
});
