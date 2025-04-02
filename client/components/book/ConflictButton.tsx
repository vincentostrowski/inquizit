import { TouchableOpacity, StyleSheet, Image } from 'react-native';
import cardsIcon from '../../assets/icons/cardsIcon.png';

export function ConflictButton() {
  return (
    <TouchableOpacity style={styles.container}>
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
    width: 35,
    height: 35,
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