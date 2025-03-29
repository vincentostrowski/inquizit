import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScopeBar() {
    return (
        <View style={styles.bar}>
            <Text>How To Win Friends and Influence Others</Text>
        </View> 
    );
}

const styles = StyleSheet.create({
    bar: {
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        backgroundColor: '#f7f7f7',
        borderColor: '#e0e0e0',
        borderWidth: 1,
    }
});