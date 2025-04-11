import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';

export function ExplanationFormat({ card }) {
  return (
    <View style={styles.container}>
        <View style={styles.banner}/> 
        <Image source={{ uri: card.insight.coverURL }} style={{ width: 50, height: 75, position: 'absolute', right: 15, marginTop: 20, zIndex: 1000}} />
        <Text style={styles.title}>{card.insight.title}</Text>
        <View style={styles.body}>
          <Text style={styles.text}>{card.explanation}</Text>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#e6e6e6',
  },
  banner: {
    width: '100%',
    height: 80,
    backgroundColor: '#f0f0f0',
    overflow: 'visible',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  body: {
    width: '100%',
    marginTop: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 75,
    paddingVertical: 20,
    // backgroundColor: 'red',
  },
  summary: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: 'semibold',
    paddingHorizontal: 30,
    opacity: 0.6,
  },
});
