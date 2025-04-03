import { TouchableOpacity, StyleSheet, Image } from 'react-native';
import quizitIcon from '../../assets/icons/quizit100.png';

export function ConflictButton() {
  return (
    <TouchableOpacity style={styles.container}>
        <Image 
          source={quizitIcon}
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
    zIndex: 1000,
  },
  icon: {
    width: '100%',
    height: '100%',
  },
}); 