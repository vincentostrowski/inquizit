import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuizitHeaderProps {
  onBack: () => void;
}

export default function QuizitHeader({
  onBack,
}: QuizitHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color="#1D1D1F" />
      </TouchableOpacity>

      {/* Rounded Title Container */}
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>
          Quizit
        </Text>
      </View>

      {/* Settings Icon */}
      <TouchableOpacity style={styles.settingsButton}>
        <Ionicons name="settings-outline" size={24} color="#1D1D1F" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50, // Account for status bar
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F2F2F7', // Light gray pill background
    borderRadius: 20, // Pill shape
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 16,
    height: 44, // Fixed height for pill shape
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    color: '#1D1D1F',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
  },
});
