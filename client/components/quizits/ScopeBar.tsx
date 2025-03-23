import { View, StyleSheet, Text } from 'react-native';

export default function ScopeBar() {
    return (
        <View style={styles.container}>
            <View style={styles.bar}>
                <Text>How To Wi... / Arouse in the other person an eager want </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 'auto',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    bar: {
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        backgroundColor: '#f7f7f7',
        borderColor: '#e0e0e0',
        borderWidth: 1,
    }
});