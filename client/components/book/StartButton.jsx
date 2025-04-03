import { Image, TouchableOpacity, StyleSheet } from 'react-native';
import cardsIcon from '../../assets/icons/cardsIcon.png';

export function StartButton() {
  return (
    <TouchableOpacity 
      style={styles.container}
    >
      <Image 
            source={cardsIcon}
            style={styles.icon}
            resizeMode="contain"
        />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  icon: {
    width: '60%',
    height: '60%',
    tintColor: '#dfdfdf',
    color: '#dfdfdf',
  },
}); 