import { View, StyleSheet, Image } from 'react-native';
import { useState } from 'react';
import { QuizitButton } from './QuizitButton';
import { ConflictButton } from './ConflictButton';
import { BackButton } from './BackButton';
import { StartButton } from './StartButton';
import { CancelButton } from './CancelButton';
import back from '../../assets/icons/backNew.png';
import { QuizitSelection } from './QuizitSelection';

export function TopBar({setTopBarHeight}) {
    const [showQuizitDropDown, setShowQuizitDropDown] = useState(false);

    return (
        <View style={styles.position}>
            <View style={styles.container}>
                {showQuizitDropDown && (
                    <QuizitSelection />
                )}
                <BackButton />
                {showQuizitDropDown ? (
                    <View style={styles.buttonContainer}>
                        <CancelButton setShowQuizitDropDown={setShowQuizitDropDown} onPress={() => setTopBarHeight(0)}/>
                        <StartButton />
                    </View>) : (
                    <View style={styles.buttonContainer}>
                        <ConflictButton />
                        <QuizitButton setShowQuizitDropDown={setShowQuizitDropDown} onPress={() => setTopBarHeight(240)}/>
                    </View>
                )}
                <Image 
                    source={back}
                    style={styles.backContainer}
                    resizeMode="contain"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    position: {
        width: '100%',
        height: 0,
        position: 'relative',
    },
    container: {
        width: '100%',
        position: 'absolute',
        top: 0,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        backgroundColor: '#dfdfdf',
        zIndex: 1000,
    },
    buttonContainer: {
        display: 'flex',
        flexDirection: 'row',
        gap: 15,
        position: 'absolute',
        right: 10,
        bottom: -30,
    },
    backContainer: {
        position: 'absolute',
        bottom: -56,
        right: 0,
        width: 140,
        height: 70,
    },
});