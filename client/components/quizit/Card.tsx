import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import ConceptFace from './ConceptFace';
import QuizitFace from './QuizitFace';

interface ConceptData {
  banner: string;
  title: string;
  description: string;
  reasoning: string;
}

interface QuizitData {
  quizit: string;
}

interface CardProps {
  faceType: 'concept' | 'quizit';
  conceptData?: ConceptData;
  quizitData?: QuizitData;
}

export function CardComponent({
  faceType,
  conceptData,
  quizitData,
}: CardProps) {
  const renderFace = () => {
    if (faceType === 'concept' && conceptData) {
      return (
        <ConceptFace
          banner={conceptData.banner}
          title={conceptData.title}
          description={conceptData.description}
          reasoning={conceptData.reasoning}
        />
      );
    }
    
    if (faceType === 'quizit' && quizitData) {
      return (
        <QuizitFace
          quizit={quizitData.quizit}
        />
      );
    }
    
    return null;
  };

  return (
    <View style={styles.container}>
      {renderFace()}
      
      {/* Inquizit Badge */}
      <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>Inquizit</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFF7ED',
    borderRadius: 24,
    position: 'relative',
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

export const Card = React.memo(CardComponent);