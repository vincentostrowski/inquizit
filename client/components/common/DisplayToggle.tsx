import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useViewMode } from '../../context/ViewModeContext';

interface DisplayToggleProps {
  // No props needed - using global context
}

export default function DisplayToggle({}: DisplayToggleProps) {
  const { viewMode, setViewMode } = useViewMode();
  return (
    <View style={styles.container}>
      <View style={styles.placeholder} />
      
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
  placeholder: {
    flex: 1,
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
});
