import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SaveIconProps {
  onToggle: () => void;
  isSelected: boolean;
}

export function SaveIconInsightPage({ onToggle, isSelected }: SaveIconProps) {
  return (
    <TouchableOpacity 
      onPress={onToggle}
      style={styles.container}
    >     
    {!isSelected ? (
      <Ionicons name="bookmark-outline" size={25} color={'#999999'} />
    ) : <View style={{height: 25, width: 25}}></View>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 7,
    paddingBottom: 8,
  },
}); 