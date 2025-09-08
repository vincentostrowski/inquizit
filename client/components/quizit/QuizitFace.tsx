import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface QuizitFaceProps {
  quizit: string;
}

export default function QuizitFace({
  quizit,
}: QuizitFaceProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {quizit}
      </Text>
      
      {/* Inquizit Badge */}
      <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>Inquizit</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    position: 'relative',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1D1F',
    lineHeight: 24,
    textAlign: 'left',
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});
