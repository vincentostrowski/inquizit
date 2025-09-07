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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1D1F',
    lineHeight: 24,
    textAlign: 'left',
  },
});
