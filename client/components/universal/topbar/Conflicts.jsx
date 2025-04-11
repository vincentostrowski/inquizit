import { View, Text, StyleSheet } from 'react-native';

export function Conflicts() { 
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Detecting identical/conflicting insights within your library...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#dfdfdf',
        zIndex: 1000,
    },
    text: {
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
    }
});