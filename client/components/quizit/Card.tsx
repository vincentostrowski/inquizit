import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { QuizitFormat } from './QuizitFormat';
import { ExplanationFormat } from './ExplanationFormat';

interface CardProps {
  card: {
    type: 'quizit' | 'concept';
    quizit?: string;
    insight?: {
      title: string;
      coverURL: string;
    };
    explanation?: string;
    banner?: string;
  };
}

export function CardComponent({ card }: CardProps) {
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
    backgroundColor: '#FFF7ED',
  },
});

export const Card = React.memo(CardComponent);