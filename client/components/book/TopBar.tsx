import { View, StyleSheet, Image } from 'react-native';
import { QuizitButton } from './QuizitButton';
import { ConflictButton } from './ConflictButton';
import back from '../../assets/icons/back.png';

export function TopBar() {
    return (
    <View style={styles.container}>
        <ConflictButton />
        <QuizitButton />
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
    top: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    height: 40,
    gap: 10,
    zIndex: 1000,
    position: 'relative',
    },
    backContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 120,
        height: 60,
    },
});