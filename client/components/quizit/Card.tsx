import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import ConceptFace from './ConceptFace';
import QuizitFace from './QuizitFace';

interface ConceptData {
  id: string;
  banner: string;
  title: string;
  description: string;
  reasoning: string;
  recognitionScore?: number;
  reasoningScore?: number;
}

interface QuizitData {
  core: string[];
  hint: string[];
  quizitId: string;
}

interface CardProps {
  faceType: 'concept' | 'quizit' | 'blank';
  conceptData?: ConceptData;
  quizitData?: QuizitData;
  onConceptTap?: () => void;
  onViewReasoning?: () => void;
  onScoreChange?: (type: 'recognition' | 'reasoning', score: number) => void;
  displayText?: string;
}

export function CardComponent({
  faceType,
  conceptData,
  quizitData,
  onConceptTap,
  onViewReasoning,
  onScoreChange,
  displayText,
}: CardProps) {
  // Preload banner image when component mounts
  useEffect(() => {
    if (faceType === 'concept' && conceptData?.banner) {
      Image.prefetch(conceptData.banner).catch(error => {
        console.warn('Failed to preload banner image:', error);
      });
    }
  }, [faceType, conceptData?.banner]);

  const renderFace = () => {
    if (faceType === 'concept' && conceptData) {
      return (
        <ConceptFace
          banner={conceptData.banner}
          title={conceptData.title}
          description={conceptData.description}
          reasoning={conceptData.reasoning}
          recognitionScore={conceptData.recognitionScore}
          reasoningScore={conceptData.reasoningScore}
          onTap={onConceptTap}
          onViewReasoning={onViewReasoning}
          onScoreChange={onScoreChange}
        />
      );
    }
    
    if (faceType === 'quizit' && quizitData) {
      return (
        <QuizitFace
          quizit={displayText || quizitData.core?.join(' ') || ''}
        />
      );
    }
    
    if (faceType === 'blank') {
      return (
        <View style={styles.blankFace} />
      );
    }
    
    return null;
  };

        return (
          <View style={styles.container}>
            {renderFace()}
          </View>
        );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFF7ED',
    borderRadius: 24,
  },
  blankFace: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
});

export const Card = React.memo(CardComponent);