import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Pressable } from 'react-native';

interface ConceptFaceProps {
  banner: string;
  title: string;
  description: string;
  reasoning: string;
  recognitionScore?: number; // 0.0-1.0 scale
  reasoningScore?: number;   // 0.0-1.0 scale
  onTap?: () => void;
  onViewReasoning?: () => void;
  onScoreChange?: (type: 'recognition' | 'reasoning', score: number) => void; // score is 0.0-1.0
}

export default function ConceptFace({
  banner,
  title,
  description,
  reasoning,
  recognitionScore,
  reasoningScore,
  onTap,
  onViewReasoning,
  onScoreChange,
}: ConceptFaceProps) {

  const handleScorePress = (type: 'recognition' | 'reasoning', score: number) => {
    onScoreChange?.(type, score);
  };

  return (
    <View style={styles.container}>
      <View style={styles.bannerContainer}>
        <Image source={{ uri: banner }} style={styles.bannerImage} />
      </View>
      
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{title}</Text>
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.textContent}>
          <Text style={styles.descriptionText}>{description}</Text>
          
          {/* View Reasoning Link */}
          <View style={styles.reasoningLink}>
            <TouchableOpacity onPress={onViewReasoning}>
              <Text style={styles.reasoningLinkText}>View Reasoning</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Score Inputs - Positioned at bottom */}
        <View style={styles.scoreInputsContainer}>
          {/* Recognition Score */}
          <View style={styles.scoreInputRow}>
            <Text style={styles.scoreLabel}>Recognition</Text>
            <View style={styles.scoreButtonsContainer}>
              <Pressable 
                style={[styles.scoreButton, recognitionScore === 0.0 && styles.scoreButtonSelected]}
                onPress={() => handleScorePress('recognition', 0.0)}
              >
                <Text style={styles.scoreButtonText}>Hard</Text>
              </Pressable>
              <Pressable 
                style={[styles.scoreButton, recognitionScore === 0.5 && styles.scoreButtonSelected]}
                onPress={() => handleScorePress('recognition', 0.5)}
              >
                <Text style={styles.scoreButtonText}>Medium</Text>
              </Pressable>
              <Pressable 
                style={[styles.scoreButton, recognitionScore === 1.0 && styles.scoreButtonSelected]}
                onPress={() => handleScorePress('recognition', 1.0)}
              >
                <Text style={styles.scoreButtonText}>Easy</Text>
              </Pressable>
            </View>
          </View>
          
          {/* Reasoning Score */}
          <View style={styles.scoreInputRow}>
            <Text style={styles.scoreLabel}>Reasoning</Text>
            <View style={styles.scoreButtonsContainer}>
              <Pressable 
                style={[styles.scoreButton, reasoningScore === 0.0 && styles.scoreButtonSelected]}
                onPress={() => handleScorePress('reasoning', 0.0)}
              >
                <Text style={styles.scoreButtonText}>Hard</Text>
              </Pressable>
              <Pressable 
                style={[styles.scoreButton, reasoningScore === 0.5 && styles.scoreButtonSelected]}
                onPress={() => handleScorePress('reasoning', 0.5)}
              >
                <Text style={styles.scoreButtonText}>Medium</Text>
              </Pressable>
              <Pressable 
                style={[styles.scoreButton, reasoningScore === 1.0 && styles.scoreButtonSelected]}
                onPress={() => handleScorePress('reasoning', 1.0)}
              >
                <Text style={styles.scoreButtonText}>Easy</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  bannerContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  titleContainer: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D1D1F',
    lineHeight: 32,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  textContent: {
    flex: 1,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1D1D1F',
    lineHeight: 24,
  },
  reasoningLink: {
    marginTop: 12,
    marginBottom: 20,
    alignSelf: 'flex-start',
    paddingRight: 12,
    paddingBottom: 12,
  },
  reasoningLinkText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#895911',
  },
  scoreInputsContainer: {
    marginTop: 0,
  },
  scoreInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1D1F',
    width: 80,
    marginRight: 12,
  },
  scoreButtonsContainer: {
    flexDirection: 'row',
    flex: 1,
    borderWidth: 1,
    borderColor: '#CEC5BC',
    borderRadius: 8,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  scoreButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  scoreButtonSelected: {
    backgroundColor: '#CEC5BC',
    borderRadius: 6,
  },
  scoreButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1D1D1F',
  },
});
