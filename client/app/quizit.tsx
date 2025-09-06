import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SafeAreaWrapper from '../components/common/SafeAreaWrapper';
import QuizitHeader from '../components/quizit/QuizitHeader';

export default function QuizitScreen() {
  const { quizitId, quizitTitle } = useLocalSearchParams();

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <QuizitHeader
        onBack={handleBack}
        quizitTitle={quizitTitle as string}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E9EA',
  },
});
