import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import SkeletonText from '../common/SkeletonText';

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
  quizit: string;
}

interface SkeletonCardProps {
  faceType: 'concept' | 'quizit' | 'blank';
  conceptData?: ConceptData;
  quizitData?: QuizitData;
  onConceptTap?: () => void;
  onViewReasoning?: () => void;
  onScoreChange?: (type: 'recognition' | 'reasoning', score: number) => void;
}

export function SkeletonCardComponent({
  faceType,
  conceptData,
  quizitData,
  onConceptTap,
  onViewReasoning,
  onScoreChange,
}: SkeletonCardProps) {
  const renderFace = () => {
    if (faceType === 'quizit') {
      return <SkeletonQuizitFace />;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {renderFace()}
    </View>
  );
}

// Skeleton Quizit Face Component
function SkeletonQuizitFace() {
  return (
    <View style={styles.quizitContainer}>
      {/* Text skeleton - multiple lines */}
      <SkeletonText width="100%" height={20} lines={8} spacing={8} borderRadius={4} />
      
      {/* Inquizit Badge - same as real component */}
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
  },
  blankFace: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  
  // Concept Face Styles
  conceptContainer: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  textContent: {
    flex: 1,
  },
  scoreInputsContainer: {
    marginTop: 0,
  },
  scoreInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  // Quizit Face Styles
  quizitContainer: {
    flex: 1,
    padding: 30,
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

export const SkeletonCard = React.memo(SkeletonCardComponent);
