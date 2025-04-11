import { TouchableOpacity, StyleSheet, Image } from 'react-native';
import approximateIcon from '../../../assets/icons/approximate.png';

export function ConflictButton({onPress}) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
        <Image 
          source={approximateIcon}
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