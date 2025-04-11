import { View, StyleSheet, Image, Animated, Text } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { QuizitButton } from '../universal/topbar/QuizitButton';
import { ConflictButton } from '../universal/topbar/ConflictButton';
import { BackButton } from '../universal/topbar/BackButton';
import { CancelButton } from '../universal/topbar/CancelButton';
import back from '../../assets/icons/backNew.png';
import { QuizitSelection } from '../universal/topbar/QuizitSelection';
import { Conflicts } from '../universal/topbar/Conflicts';
import SearchBar from './SearchBar'

export function TopBar({}) {
    const [showQuizitDropDown, setShowQuizitDropDown] = useState(false);
    const [showConflictsDropDown, setShowConflictsDropDown] = useState(false);
    const animatedHeight = useRef(new Animated.Value(0)).current; // Start with height 0

    useEffect(() => {
        // Animate the height when showQuizitDropDown changes
        Animated.timing(animatedHeight, {
        toValue: showQuizitDropDown ? 120 : 0, // Target height (adjust as needed)
        duration: 300, // Animation duration in milliseconds
        useNativeDriver: false, // Height animation requires useNativeDriver: false
        }).start();

    }, [showQuizitDropDown]);

    useEffect(() => {
        Animated.timing(animatedHeight, {
        toValue: showConflictsDropDown ? 40 : 0, 
        duration: 300, 
        useNativeDriver: false, 
        }).start();

    }, [showConflictsDropDown]);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.animatedContainer, { height: animatedHeight }]}>
                {showQuizitDropDown && <QuizitSelection/>}
                {showConflictsDropDown && <Conflicts/>}
            </Animated.View>
            {showQuizitDropDown && (
                <View style={styles.buttonContainer}>
                    <CancelButton onPress={() => setShowQuizitDropDown(false)}/>
                    <QuizitButton onPress={() => null}/>
                </View>)}
            {showConflictsDropDown && (
                <View style={styles.buttonContainer}>
                    <ConflictButton onPress={() => null}/>
                    <CancelButton onPress={() => setShowConflictsDropDown(false)}/>
                </View>
            )}
            {!showConflictsDropDown && !showQuizitDropDown && (
                <View style={styles.buttonContainer}>
                    <ConflictButton onPress={() => setShowConflictsDropDown(true)}/>
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
    },
    animatedContainer: {
        overflow: 'hidden', // Ensure content stays within bounds during animation
        width: '100%', // Match the width of the parent container
        // backgroundColor: 'blue',
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
        zIndex: 1,
    },
});