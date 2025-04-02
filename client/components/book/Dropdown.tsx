import { TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export function Dropdown({onPress}) {
  return (
    <TouchableOpacity style={styles.click} onPress={onPress}>
        <Icon name="arrow-drop-down" size={24} color="black"/>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
    click: {
        width: 70,
        height: 40,
        paddingRight: 30,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        top: -1,
    },
});