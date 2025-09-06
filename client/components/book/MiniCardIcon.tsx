import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MiniCardIconProps {
  size?: number;
}

export default function MiniCardIcon({ size = 20 }: MiniCardIconProps) {
  return (
    <View style={[styles.miniCard, { width: size, height: size }]}>
      {/* Mini Cover */}
      <View style={styles.miniCover} />
      {/* Mini Title */}
      <View style={styles.miniTitle} />
      {/* Mini Description */}
      <View style={styles.miniDescription} />
      <View style={styles.miniDescription} />
      <View style={styles.miniDescription} />
      <View style={styles.miniDescription} />
    </View>
  );
}

const styles = StyleSheet.create({
  miniCard: {
    backgroundColor: '#FFF7ED', // Same orange background as full cards
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    padding: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0.5, height: 0.5 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  miniCover: {
    width: '100%',
    height: 6,
    backgroundColor: '#9CA3AF',
    borderRadius: 1,
    marginBottom: 1,
  },
  miniTitle: {
    width: '80%',
    height: 1,
    backgroundColor: 'gray',
    borderRadius: 0.5,
    marginBottom: 1,
    paddingHorizontal: 1,
    opacity: 0.5,
  },
  miniDescription: {
    width: '90%',
    height: 0.5,
    backgroundColor: 'gray',
    borderRadius: 0.5,
    marginBottom: 1,
    opacity: 0.5,
  },
});
