import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

export function ExplanationFormat({ card }) {
  return (
    <View style={styles.container}>
        <Text style={styles.title}>{card.title}</Text>
        <Text style={styles.summary}>{card.summary}</Text>
      {
        card.explanations.map((sentence, index) => (
        <Text key={index} style={styles.text}>{sentence}</Text>
        ))
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  summary: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
