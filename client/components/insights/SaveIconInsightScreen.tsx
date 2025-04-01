import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SaveIconProps {
  isSelected: boolean;
  onToggle: () => void;
  size?: number;
}

export function SaveIconInsightScreen({ isSelected, onToggle, size = 24 }: SaveIconProps) {
  return (
    <TouchableOpacity 
      onPress={onToggle}
      style={styles.container}
    >
      {isSelected ? (
        <Ionicons name="bookmark" size={size} color={'black'}/>
      ) : (
        <View style={{position: 'relative', height: size, width: size}}>
            <View style={{position: 'absolute', zIndex: 2}}>
                <Ionicons name="bookmark-outline" size={size} color={'#dfdfdf'} />
            </View>
            <View style={{position: 'absolute', zIndex: 1}}>
                <Ionicons name="bookmark" size={size} color={'#f2f2f2'}/>
            </View>
        </View>
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