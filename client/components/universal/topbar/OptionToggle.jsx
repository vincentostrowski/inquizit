import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function OptionToggle({leftLabel, rightLabel, onToggle, left}) {
  const [leftSide, setLeftSide] = useState(left);

  const handleToggle = () => {
    setLeftSide((prev) =>  !prev);
    onToggle();
  };

  return (
    <View style={styles.container}>
      <View style={styles.label}>
        <Text style={styles.text}>{leftLabel}</Text>
      </View>
      <TouchableOpacity style={styles.toggle} onPress={handleToggle}>
        <View style={[styles.circle, !leftSide && styles.right]} />
      </TouchableOpacity>
      <View style={styles.label}>
        <Text style={styles.text}>{rightLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggle: {
    width: 40,
    height: 20,
    borderRadius: 30,
    backgroundColor: '#ccc',
    justifyContent: 'center',
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 15,
    backgroundColor: 'gray',
    position: 'absolute',
    left: 0,
  },
  right: {
    left: 20,
  },
  label: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
  },
});
