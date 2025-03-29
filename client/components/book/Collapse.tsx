import { View, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export function Collapse({onPress}) {
  return (
    <Pressable style={styles.click} onPress={onPress}>
        <Icon name="arrow-drop-up" size={24} color="black"/>
    </Pressable>
  );
}

const styles = StyleSheet.create({
    click: {
        width: 70,
        height: 40,
        paddingLeft: 30,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
});