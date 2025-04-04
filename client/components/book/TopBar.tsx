import { View, StyleSheet, Image, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { QuizitButton } from './QuizitButton';
import { ConflictButton } from './ConflictButton';
import { BackButton } from './BackButton';
import { CancelButton } from './CancelButton';
import back from '../../assets/icons/backNew.png';
import { QuizitSelection } from './QuizitSelection';

export function TopBar() {
    const [showQuizitDropDown, setShowQuizitDropDown] = useState(false);
    const animatedHeight = useRef(new Animated.Value(0)).current; // Start with height 0

    useEffect(() => {
        // Animate the height when showQuizitDropDown changes
        Animated.timing(animatedHeight, {
        toValue: showQuizitDropDown ? 150 : 0, // Target height (adjust as needed)
        duration: 300, // Animation duration in milliseconds
        useNativeDriver: false, // Height animation requires useNativeDriver: false
        }).start();
    }, [showQuizitDropDown]);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.animatedContainer, { height: animatedHeight }]}>
                {showQuizitDropDown && <QuizitSelection />}
            </Animated.View>
            <BackButton />
            {showQuizitDropDown ? (
                <View style={styles.buttonContainer}>
                    <CancelButton setShowQuizitDropDown={setShowQuizitDropDown}/>
                    <QuizitButton onPress={() => null}/>
                </View>) : (
                <View style={styles.buttonContainer}>
                    <ConflictButton />
                    <QuizitButton onPress={() => setShowQuizitDropDown(true)}/>
                </View>
            )}
            <Image 
                source={back}
                style={styles.backContainer}
                resizeMode="contain"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        zIndex: 500,
    },
    animatedContainer: {
        overflow: 'hidden', // Ensure content stays within bounds during animation
        width: '100%', // Match the width of the parent container
      },
    buttonContainer: {
        display: 'flex',
        flexDirection: 'row',
        gap: 10,
        position: 'absolute',
        right: 10,
        bottom: -30,
    },
    backContainer: {
        position: 'absolute',
        bottom: -56,
        right: -5,
        width: 140,
        height: 70,
    },
});