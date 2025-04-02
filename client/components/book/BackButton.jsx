import { TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons'; 

export function BackButton() {

  return (
      <TouchableOpacity 
        style={styles.container}
        onPress={() => router.back()}
      >
        <Icon name="arrow-back" size={28} color='black' />
      </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    position: 'absolute',
    left: 5,
    top: 5,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  icon: {
    width: '60%',
    height: '60%',
    tintColor: '#dfdfdf',
    color: '#dfdfdf',
    zIndex: 3000,
  },
}); 