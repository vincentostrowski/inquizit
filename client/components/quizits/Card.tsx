import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { QuizitFormat } from './QuizitFormat';
import { ExplanationFormat } from './ExplanationFormat';

export function CardComponent({ card }) {
  return (
    <View style={styles.container}>
      {
        card.type === 'quizit' ? (
          <QuizitFormat card={card} />
        ) : (
          <ExplanationFormat card={card} />
        )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    // backgroundColor: 'red',
  },
});

export const Card = React.memo(CardComponent);