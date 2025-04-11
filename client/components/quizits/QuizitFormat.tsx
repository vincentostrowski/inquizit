import {useState} from 'react';
import { View, StyleSheet, Text } from 'react-native';

export function QuizitFormat({ card }) {

  return (
    <View style={styles.container}>
        <Text style={styles.text}>{card.quizit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#e6e6e6'
  },
  text: {
    width: '100%',
    opacity: 0.6,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    // backgroundColor: 'red',
  },
});
