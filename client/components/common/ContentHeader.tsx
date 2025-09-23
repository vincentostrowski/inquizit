import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ContentHeaderProps {
  onBack: () => void;
  onStartQuizit: () => void;
  onCheckConflicts: () => void;
  onViewPastQuizits: () => void;
  headerColor?: string;
  buttonTextBorderColor?: string;
  buttonCircleColor?: string;
  isEditMode?: boolean;
}

export default function ContentHeader({ 
  onBack, 
  onStartQuizit, 
  onCheckConflicts, 
  onViewPastQuizits,
  headerColor = 'green',
  buttonTextBorderColor = 'green',
  buttonCircleColor = 'green',
  isEditMode = false,
}: ContentHeaderProps) {

  const insets = useSafeAreaInsets();

  // Function to create a progress bar background that contrasts with the header color
  const getProgressBarBackgroundColor = (color: string) => {
    // Convert color to RGB values for brightness calculation
    const getRGBFromColor = (colorStr: string) => {
      // Handle hex colors
      if (colorStr.startsWith('#')) {
        const hex = colorStr.replace('#', '');
        if (hex.length === 3) {
          // Short hex like #abc -> #aabbcc
          const r = parseInt(hex[0] + hex[0], 16);
          const g = parseInt(hex[1] + hex[1], 16);
          const b = parseInt(hex[2] + hex[2], 16);
          return { r, g, b };
        } else if (hex.length === 6) {
          const r = parseInt(hex.substr(0, 2), 16);
          const g = parseInt(hex.substr(2, 2), 16);
          const b = parseInt(hex.substr(4, 2), 16);
          return { r, g, b };
        }
      }
      
      // Handle named colors
      const namedColors: { [key: string]: { r: number; g: number; b: number } } = {
        'white': { r: 255, g: 255, b: 255 },
        'black': { r: 0, g: 0, b: 0 },
        'red': { r: 255, g: 0, b: 0 },
        'green': { r: 0, g: 128, b: 0 },
        'blue': { r: 0, g: 0, b: 255 },
        'yellow': { r: 255, g: 255, b: 0 },
        'orange': { r: 255, g: 165, b: 0 },
        'purple': { r: 128, g: 0, b: 128 },
        'pink': { r: 255, g: 192, b: 203 },
        'gray': { r: 128, g: 128, b: 128 },
        'dark': { r: 64, g: 64, b: 64 },
        'navy': { r: 0, g: 0, b: 128 },
        'maroon': { r: 128, g: 0, b: 0 },
      };
      
      return namedColors[colorStr.toLowerCase()] || { r: 128, g: 128, b: 128 }; // fallback to gray
    };
    
    const { r, g, b } = getRGBFromColor(color);
    
    // Calculate brightness using luminance formula
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // If dark (brightness < 128), use white background, otherwise use black
    return brightness < 128 
      ? 'rgba(255, 255, 255, 0.2)' 
      : 'rgba(0, 0, 0, 0.1)';
  };

  return (
    <View style={[styles.container, { backgroundColor: headerColor }]}>
      <StatusBar 
        backgroundColor={headerColor}
        translucent={false}
      />
      <View style={[styles.statusBarArea, { height: insets.top, backgroundColor: headerColor }]} />
      <View style={styles.content}>
        <TouchableOpacity onPress={onBack} style={[styles.backButton, { borderColor: buttonTextBorderColor }]}>
          <Ionicons name="chevron-back" size={24} color={buttonTextBorderColor} />
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { 
            borderColor: buttonTextBorderColor,
            backgroundColor: getProgressBarBackgroundColor(headerColor)
          }]}>
            <View style={[styles.progressFill, { width: '5%', backgroundColor: buttonCircleColor }]} />
          </View>
        </View>
    
        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={[
              styles.button, 
              { borderColor: buttonTextBorderColor },
              isEditMode && styles.disabledButton
            ]} 
            onPress={isEditMode ? undefined : onStartQuizit}
            disabled={isEditMode}
          >
            <View style={[styles.buttonCircle, { backgroundColor: buttonCircleColor }]}>
              <Ionicons name="layers" size={16} color={headerColor} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.button, 
              { borderColor: buttonTextBorderColor },
              isEditMode && styles.disabledButton
            ]} 
            onPress={isEditMode ? undefined : () => {}}
            disabled={isEditMode}
          >
            <View style={[styles.buttonCircle, { backgroundColor: buttonCircleColor }]}>
              <Ionicons name="ellipsis-horizontal" size={16} color={headerColor} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // No padding here - handled by content
  },
  statusBarArea: {
    // This will be sized dynamically based on insets.top
  },
  content: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    height: 60,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
    padding: 4,
  },
  progressContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 32,
    paddingRight: 16,
    height: '100%',
  },
  progressBar: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  progressFill: {
    height: '100%',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 20,
    padding: 4,
  },
  disabledButton: {
    opacity: 0.2,
  },
  buttonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 10,
    textAlign: 'left',
    lineHeight: 12,
  },
});
