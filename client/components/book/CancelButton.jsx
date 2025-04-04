import { Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 

export function CancelButton({setShowQuizitDropDown}) {

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => { 
        setShowQuizitDropDown(false)}}
    >
      <Icon name="close" size={15} color='white' />
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
}); 