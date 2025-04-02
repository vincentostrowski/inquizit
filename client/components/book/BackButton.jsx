import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function BackButton() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { top: insets.top}]}>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.back()}
      >
        <Icon name="arrow-back" size={24} color="gray" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 30, 
    position: 'absolute',
    paddingTop: 15,
    paddingLeft: 7,
    zIndex: 100,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  button: {
    width: 35,
    height: 35,
    zIndex: 1000,
    // backgroundColor: '#dfdfdf',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: '100%',
    height: '100%',
  },
}); 