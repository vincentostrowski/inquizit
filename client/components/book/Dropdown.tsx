import { View, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export function Dropdown({onPress}) {
  return (
    <Pressable style={styles.click} onPress={onPress}>
        <View style={styles.icon}>
            <Icon name="arrow-drop-down" size={24} color="white"/>
        </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
    click: {
        width: 50,
        height: 50,
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