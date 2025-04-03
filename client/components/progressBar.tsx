import { View, StyleSheet } from 'react-native';

export function ProgressBar () {

    return (
        <View style={style.container}>
            <View style={style.saved}></View>
            <View style={style.done}></View>
        </View>
    )
}

const style = StyleSheet.create({
    container: {
        width: '100%',
        height: 5,
        borderRadius: 10,
        borderColor: 'gray',
        borderWidth: 0.3,
        opacity: 0.5,
    },
    saved: {
        width: '60%',
        height: 4.7,
        backgroundColor: 'gray',
        borderRadius: 10,
        position: 'absolute',
        zIndex: 1,
    },
    done: {
        width: '40%',
        height: 4.7,
        backgroundColor: 'black',
        borderRadius: 10,
        position: 'absolute',
        zIndex: 2,
    }
});