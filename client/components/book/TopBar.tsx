import { View, StyleSheet, Image } from 'react-native';
import { QuizitButton } from './QuizitButton';
import { ConflictButton } from './ConflictButton';
import back from '../../assets/icons/backNew.png';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function TopBar() {
    const insets = useSafeAreaInsets();

    return (
    <View style={[styles.container, {top: insets.top}]}>
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
    right: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 15,
    paddingHorizontal: 10,
    height: 30,
    gap: 10,
    zIndex: 1000,
    position: 'absolute',
    },
    backContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 140,
        height: 70,
    },
});