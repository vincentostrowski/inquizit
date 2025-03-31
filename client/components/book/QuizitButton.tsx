import { Image, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import quizitIcon from '../../assets/icons/quizit100.png';

export function QuizitButton() {
  return (
    <Pressable 
      style={styles.container}
      onPress={() => router.push('/quizit')}
    >
      <Image 
        source={quizitIcon}
        style={styles.icon}
        resizeMode="contain"
      />
    </Pressable>
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