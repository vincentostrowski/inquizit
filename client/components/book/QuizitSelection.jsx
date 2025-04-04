import { View, StyleSheet } from 'react-native';

export function QuizitSelection() {
    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}></View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#dfdfdf',
        padding: 20,
    },
    innerContainer: { 
        height: 50,
        width: '100%',
    },
    text: {
        fontSize: 20,
        color: '#333',
    },
});

