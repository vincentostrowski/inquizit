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
        width: 40,
        height: 40,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    }
});