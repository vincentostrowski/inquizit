import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface CardProps {
  title: string;
}

export function Card({ title }: CardProps) {
  return (
    <View style={[ styles.card] }>
      <View style={styles.body}>
        <Text style={styles.text}>Maya invites Alex to share what challenges he encountered.</Text>
        <Text style={styles.text}>Alex explains that unexpected technical issues and miscommunication with another team member contributed to the delay.</Text>
        <Text style={styles.text}>Instead of reacting negatively, Maya listens attentively, showing empathy for the unforeseen hurdles.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff1e1',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    borderRadius: 10,
    padding: 20,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
