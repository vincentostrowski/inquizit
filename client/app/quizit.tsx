import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SafeAreaWrapper from '../components/common/SafeAreaWrapper';
import QuizitHeader from '../components/quizit/QuizitHeader';

export default function QuizitScreen() {
  const { quizitId } = useLocalSearchParams();

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaWrapper backgroundColor="#F8F9FA">
      <QuizitHeader
        onBack={handleBack}
      />
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  quizitId: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#1D1D1F',
    lineHeight: 24,
    marginBottom: 32,
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
});
