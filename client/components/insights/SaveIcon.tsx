import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SaveIconProps {
  isSelected: boolean;
  onToggle: () => void;
  size?: number;
}

export function SaveIcon({ isSelected, onToggle, size = 24 }: SaveIconProps) {
  return (
    <TouchableOpacity 
      onPress={onToggle}
      style={styles.container}
    >
      {isSelected ? (
        <Ionicons name="bookmark" size={size} color={'black'} />
      ) : (
        <Ionicons name="bookmark-outline" size={size} color={'#999999'} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
}); 