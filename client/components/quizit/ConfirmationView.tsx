import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ConfirmationViewProps {
  onDiscard: () => void;
  onRestore: () => void;
}

export default function ConfirmationView({ onDiscard, onRestore }: ConfirmationViewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        Your configuration will be discarded if you close
      </Text>
      
      <View style={styles.divider} />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.bottomButton}
          onPress={onRestore}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Restore</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bottomButton}
          onPress={onDiscard}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Discard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  message: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1D1D1F',
    textAlign: 'center',
    padding: 30,
    lineHeight: 22,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E5E5E7',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    justifyContent: 'center',
  },
  bottomButton: {
    width: '37.5%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E5E7',
  },
  buttonText: {
    color: '#1D1D1F',
    fontSize: 14,
    fontWeight: '500',
  },
});