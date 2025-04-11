import { View, StyleSheet, Animated } from 'react-native';
import { useRef, useEffect } from 'react';

export function ProgressBar ({ fraction,}) {
    
    const animatedFraction = useRef(new Animated.Value(fraction)).current;
    
    // Animate the progress bar when the fraction computed
    useEffect(() => {
    // Animate the fraction value when it changes
    Animated.timing(animatedFraction, {
        toValue: fraction,
        duration: 500, // Animation duration in milliseconds
        useNativeDriver: false, // `false` because we're animating width (layout property)
    }).start();
    }, [fraction]);
    
    const animatedWidth = animatedFraction.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'], // Map fraction (0 to 1) to percentage width
    });

    return (
        <View style={style.container}>
            <Animated.View style={[
                      style.saved, 
                      { width: animatedWidth }
                    ]}/>
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
        width: 0,
        height: 4.7,
        backgroundColor: 'black',
        opacity: 0.2,
        borderRadius: 10,
        position: 'absolute',
        zIndex: 1,
    },
    done: {
        width: 0,
        height: 4.7,
        backgroundColor: 'black',
        borderRadius: 10,
        position: 'absolute',
        zIndex: 2,
    }
});