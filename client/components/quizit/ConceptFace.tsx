import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface ConceptFaceProps {
  banner: string;
  title: string;
  description: string;
  reasoning: string;
}

export default function ConceptFace({
  banner,
  title,
  description,
  reasoning,
}: ConceptFaceProps) {
  return (
    <View style={styles.container}>
      <View style={styles.bannerContainer}>
        <Image source={{ uri: banner }} style={styles.bannerImage} />
      </View>
      
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{title}</Text>
      </View>
      
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>{description}</Text>
      </View>
      
      <View style={styles.reasoningContainer}>
        <Text style={styles.reasoningLabel}>Reasoning</Text>
        <Text style={styles.reasoningText}>{reasoning}</Text>
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
  },
  titleText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D1D1F',
    lineHeight: 32,
    textAlign: 'center',
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
  reasoningContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
  },
  reasoningLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reasoningText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1D1D1F',
    lineHeight: 24,
  },
});
