import { View, StyleSheet, Image } from 'react-native';
import { QuizitButton } from './QuizitButton';
import { BackButton } from './BackButton';
import back from '../../assets/icons/backNew.png';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function TopBar() {
    const insets = useSafeAreaInsets();

    return (
    <View style={[styles.container, {top: insets.top}]}>
        <BackButton />
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
    width: '100%',
    left: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 30,
    gap: 15,
    zIndex: 1000,
    position: 'absolute',
    },
    backContainer: {
        position: 'absolute',
        top: -13,
        right: 0,
        width: 140,
        height: 70,
    },
});