import {useState} from 'react';
import { View, StyleSheet, Text } from 'react-native';

export function QuizitFormat({ card }) {

  return (
    <View style={styles.container}>
      {
        card.body.map((sentence, index) => (
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    width: '100%',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    // backgroundColor: 'red',
  },
});
