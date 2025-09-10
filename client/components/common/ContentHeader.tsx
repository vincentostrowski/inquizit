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

  return (
    <View style={[styles.container, { backgroundColor: headerColor }]}>
      <StatusBar 
        backgroundColor={headerColor}
        translucent={false}
      />
      <View style={[styles.statusBarArea, { height: insets.top, backgroundColor: headerColor }]} />
      <View style={styles.content}>
        <TouchableOpacity onPress={onBack} style={[styles.backButton, { borderColor: buttonTextBorderColor }]}>
          <Ionicons name="chevron-back" size={20} color={buttonTextBorderColor} />
        </TouchableOpacity>
        
        <View style={styles.buttons}>
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
              <Ionicons name="document-text" size={16} color={headerColor} />
            </View>
            <Text style={[styles.buttonText, { color: buttonTextBorderColor }]}>
              Start Quizit{'\n'}Session
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.button, 
              { borderColor: buttonTextBorderColor },
              isEditMode && styles.disabledButton
            ]} 
            onPress={isEditMode ? undefined : onCheckConflicts}
            disabled={isEditMode}
          >
            <View style={[styles.buttonCircle, { backgroundColor: buttonCircleColor }]}>
              <Ionicons name="warning" size={16} color={headerColor} />
            </View>
            <Text style={[styles.buttonText, { color: buttonTextBorderColor }]}>
              Check for{'\n'}Conflicts
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.button, 
              { borderColor: buttonTextBorderColor },
              isEditMode && styles.disabledButton
            ]} 
            onPress={isEditMode ? undefined : onViewPastQuizits}
            disabled={isEditMode}
          >
            <View style={[styles.buttonCircle, { backgroundColor: buttonCircleColor }]}>
              <Ionicons name="refresh" size={16} color={headerColor} />
            </View>
            <Text style={[styles.buttonText, { color: buttonTextBorderColor }]}>
              View Past{'\n'}Quizits
            </Text>
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
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
    padding: 4,
  },
  buttons: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    padding: 4,
    paddingRight: 16,
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
    marginRight: 4,
  },
  buttonText: {
    fontSize: 10,
    textAlign: 'left',
    lineHeight: 12,
  },
});
